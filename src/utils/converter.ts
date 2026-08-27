import Papa from 'papaparse';
import {
  RawNFTMetadata,
  ParsedNFTItem,
  NFTAttribute,
  ValidationIssue,
  ConversionOptions,
  TraitDefinition,
  BatchProcessingStats,
  MappingRule
} from '../types';
import {
  extractRawPathValue,
  evaluateArrayValue,
  formatColumnHeader,
  applyValueTransforms
} from './pathExtractor';

/**
 * Recursively flattens any nested JavaScript object with dot notation or custom separator
 */
export function flattenObject(
  obj: Record<string, any>,
  prefix = '',
  separator = '.',
  res: Record<string, any> = {}
): Record<string, any> {
  if (!obj || typeof obj !== 'object') return res;

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}${separator}${key}` : key;

    if (value === null || value === undefined) {
      res[newKey] = '';
    } else if (Array.isArray(value)) {
      // If it's a simple primitive array, join with commas; if objects, stringify or flatten
      if (value.every(v => typeof v !== 'object' || v === null)) {
        res[newKey] = value.join(', ');
      } else {
        // Array of objects
        res[newKey] = JSON.stringify(value);
      }
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      flattenObject(value, newKey, separator, res);
    } else {
      res[newKey] = value;
    }
  }

  return res;
}

/**
 * Normalizes attributes from any format (OpenSea array, dictionary, traits, properties)
 */
export function extractNormalizedAttributes(
  raw: RawNFTMetadata,
  separator = '.'
): { attributes: NFTAttribute[]; extraFlattenedProps: Record<string, any> } {
  const result: NFTAttribute[] = [];
  const extraFlattenedProps: Record<string, any> = {};

  const sourceAttrs = raw.attributes || raw.traits || raw.properties;

  if (Array.isArray(sourceAttrs)) {
    for (const attr of sourceAttrs) {
      if (attr && typeof attr === 'object') {
        if ('trait_type' in attr || 'name' in attr || 'key' in attr) {
          const traitType = String(attr.trait_type || attr.name || attr.key || '').trim();
          let val = attr.value;

          // If value is a nested object, flatten it
          if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
            const flatNested = flattenObject(val, traitType, separator);
            for (const [k, v] of Object.entries(flatNested)) {
              result.push({
                trait_type: k,
                value: v,
                display_type: attr.display_type,
                max_value: attr.max_value
              });
            }
          } else {
            result.push({
              trait_type: traitType || 'Unnamed Trait',
              value: val ?? '',
              display_type: attr.display_type,
              max_value: attr.max_value
            });
          }
        } else {
          // Object without trait_type key - flatten its key-values
          for (const [k, v] of Object.entries(attr)) {
            result.push({
              trait_type: k,
              value: typeof v === 'object' ? JSON.stringify(v) : v
            });
          }
        }
      }
    }
  } else if (sourceAttrs && typeof sourceAttrs === 'object') {
    // Key-value dictionary e.g. { "Background": "Blue", "Level": 5 }
    for (const [key, value] of Object.entries(sourceAttrs)) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        const flatNested = flattenObject(value, key, separator);
        for (const [k, v] of Object.entries(flatNested)) {
          result.push({
            trait_type: k,
            value: v
          });
        }
      } else {
        result.push({
          trait_type: key,
          value: value ?? ''
        });
      }
    }
  }

  // Also check for any custom root level objects like stats, equipment, lore, etc.
  const standardKeys = new Set([
    'name', 'description', 'image', 'image_url', 'image_data', 'external_url',
    'animation_url', 'youtube_url', 'background_color', 'token_id', 'tokenId',
    'id', 'edition', 'dna', 'compiler', 'date', 'attributes', 'traits', 'properties'
  ]);

  for (const [key, val] of Object.entries(raw)) {
    if (!standardKeys.has(key) && val !== null && val !== undefined) {
      if (typeof val === 'object') {
        const flattened = flattenObject(val, key, separator);
        Object.assign(extraFlattenedProps, flattened);
      } else {
        extraFlattenedProps[key] = val;
      }
    }
  }

  return { attributes: result, extraFlattenedProps };
}

/**
 * Resolves Token ID from various strategies
 */
export function resolveTokenId(
  raw: RawNFTMetadata,
  fileName: string,
  index: number,
  strategy: ConversionOptions['tokenIdSource']
): string | number {
  if (strategy === 'auto_0') return index;
  if (strategy === 'auto_1') return index + 1;
  if (strategy === 'edition' && raw.edition !== undefined && raw.edition !== '') return raw.edition;
  if (strategy === 'token_id' && (raw.token_id !== undefined || raw.tokenId !== undefined || raw.id !== undefined)) {
    return raw.token_id ?? raw.tokenId ?? raw.id ?? (index + 1);
  }
  if (strategy === 'file_name') {
    const match = fileName.match(/^(\d+)(?:\.json)?$/i);
    if (match) return parseInt(match[1], 10);
    const cleaned = fileName.replace(/\.json$/i, '');
    return cleaned || (index + 1);
  }

  // Default fallback
  return raw.token_id ?? raw.tokenId ?? raw.id ?? raw.edition ?? (index + 1);
}

/**
 * Validates individual NFT metadata item against OpenSea & ERC-721/1155 standards
 */
export function validateNFTItem(
  raw: RawNFTMetadata,
  attributes: NFTAttribute[],
  tokenId: string | number,
  fileName: string,
  index: number,
  allTokenIds: Set<string | number>
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const addIssue = (
    severity: 'error' | 'warning' | 'info',
    field: string,
    message: string,
    fixable = false,
    fixType?: ValidationIssue['fixType']
  ) => {
    issues.push({
      id: `val-${index}-${field}-${Math.random().toString(36).substr(2, 6)}`,
      severity,
      field,
      message,
      fixable,
      fixType,
      tokenId,
      fileName,
      itemIndex: index
    });
  };

  // 1. Name validation
  if (!raw.name || typeof raw.name !== 'string' || !raw.name.trim()) {
    addIssue('error', 'name', 'Missing required NFT name.', true, 'fallback_name');
  }

  // 2. Image validation
  const img = raw.image || raw.image_url || raw.image_data;
  if (!img || (typeof img === 'string' && !img.trim())) {
    addIssue('error', 'image', 'Missing required image URL, IPFS CID, or raw image_data.');
  } else if (typeof img === 'string') {
    if (img.startsWith('http://')) {
      addIssue('warning', 'image', 'Insecure HTTP image URL. Prefer HTTPS or IPFS (ipfs://...).');
    }
  }

  // 3. Background Color validation (OpenSea spec: 6-char hex without #)
  if (raw.background_color) {
    const bg = String(raw.background_color).trim();
    if (bg.startsWith('#')) {
      addIssue(
        'warning',
        'background_color',
        `OpenSea background_color "${bg}" should not contain '#' prefix.`,
        true,
        'strip_hash'
      );
    } else if (!/^[0-9A-Fa-f]{6}$/.test(bg)) {
      addIssue('error', 'background_color', `Invalid background_color "${bg}". Must be 6-character hexadecimal.`);
    }
  }

  // 4. External URL & Animation URL checks
  if (raw.external_url && typeof raw.external_url === 'string' && !/^https?:\/\//i.test(raw.external_url)) {
    addIssue('info', 'external_url', `external_url "${raw.external_url}" does not have http/https protocol.`);
  }

  // 5. Attributes validation
  if (!attributes || attributes.length === 0) {
    addIssue('info', 'attributes', 'No attributes or traits found for this token.');
  } else {
    for (const attr of attributes) {
      const traitName = attr.trait_type || 'Unnamed';

      if (attr.value === undefined || attr.value === null || attr.value === '') {
        addIssue('warning', `attribute[${traitName}]`, `Trait "${traitName}" has an empty value.`);
      }

      if (attr.display_type) {
        if (attr.display_type === 'boost_number' || attr.display_type === 'boost_percentage' || attr.display_type === 'number') {
          if (isNaN(Number(attr.value))) {
            addIssue(
              'error',
              `attribute[${traitName}]`,
              `Trait "${traitName}" specifies display_type "${attr.display_type}" but value "${attr.value}" is not numeric.`
            );
          }
          if (attr.max_value !== undefined && Number(attr.value) > Number(attr.max_value)) {
            addIssue(
              'warning',
              `attribute[${traitName}]`,
              `Trait "${traitName}" value (${attr.value}) exceeds max_value (${attr.max_value}).`
            );
          }
        } else if (attr.display_type === 'date') {
          const num = Number(attr.value);
          if (isNaN(num) || num < 0) {
            addIssue('error', `attribute[${traitName}]`, `Date trait "${traitName}" must be a valid Unix timestamp.`);
          }
        }
      }
    }
  }

  // 6. Token ID uniqueness
  if (allTokenIds.has(tokenId)) {
    addIssue('warning', 'token_id', `Duplicate token ID "${tokenId}" detected across batch.`, true, 'auto_token_id');
  }

  return issues;
}

/**
 * Parses raw input (single JSON, array of JSONs, or multiple files) into structured items
 */
export function parseAndProcessMetadata(
  filesData: Array<{ fileName: string; content: string }>,
  options: ConversionOptions
): {
  items: ParsedNFTItem[];
  allTraits: Map<string, TraitDefinition>;
  stats: BatchProcessingStats;
} {
  const items: ParsedNFTItem[] = [];
  const rawList: Array<{ fileName: string; raw: RawNFTMetadata }> = [];

  // Step 1: Parse all raw JSONs
  for (const file of filesData) {
    try {
      const parsed = JSON.parse(file.content);
      if (Array.isArray(parsed)) {
        // Multi-item JSON (e.g. _metadata.json from HashLips)
        parsed.forEach((rawObj, idx) => {
          if (rawObj && typeof rawObj === 'object') {
            rawList.push({
              fileName: `${file.fileName.replace(/\.json$/i, '')}_${idx + 1}.json`,
              raw: rawObj
            });
          }
        });
      } else if (parsed && typeof parsed === 'object') {
        rawList.push({
          fileName: file.fileName,
          raw: parsed
        });
      }
    } catch (e: any) {
      // Record syntax parse failure
      items.push({
        id: `err-${file.fileName}`,
        itemIndex: items.length,
        fileName: file.fileName,
        tokenId: 'ERROR',
        raw: {},
        flattenedData: {},
        attributes: [],
        issues: [{
          id: `json-syntax-${file.fileName}`,
          severity: 'error',
          field: 'JSON',
          message: `Invalid JSON syntax: ${e.message}`,
          fixable: false,
          fileName: file.fileName,
          itemIndex: items.length
        }]
      });
    }
  }

  // Step 2: Normalize attributes, resolve IDs and validate
  const seenTokenIds = new Set<string | number>();
  const traitsMap = new Map<string, TraitDefinition>();

  rawList.forEach((entry, index) => {
    let raw = { ...entry.raw };

    // Auto fix if enabled
    if (options.cleanHexColors && raw.background_color && String(raw.background_color).startsWith('#')) {
      raw.background_color = String(raw.background_color).replace(/^#/, '');
    }
    if (options.autoFillEmptyNames && (!raw.name || !String(raw.name).trim())) {
      const tempId = resolveTokenId(raw, entry.fileName, index, options.tokenIdSource);
      raw.name = `NFT #${tempId}`;
    }

    const tokenId = resolveTokenId(raw, entry.fileName, index, options.tokenIdSource);
    const { attributes, extraFlattenedProps } = extractNormalizedAttributes(raw, options.nestedSeparator);

    const issues = validateNFTItem(raw, attributes, tokenId, entry.fileName, index, seenTokenIds);
    seenTokenIds.add(tokenId);

    // Build flattened row data
    const flattenedData: Record<string, any> = {
      token_id: tokenId,
      name: raw.name || '',
      description: raw.description || '',
      image: raw.image || raw.image_url || raw.image_data || '',
      external_url: raw.external_url || '',
      animation_url: raw.animation_url || '',
      youtube_url: raw.youtube_url || '',
      background_color: raw.background_color || ''
    };

    // Add extra root metadata if present
    if (raw.dna) flattenedData.dna = raw.dna;
    if (raw.edition) flattenedData.edition = raw.edition;
    if (raw.compiler) flattenedData.compiler = raw.compiler;
    if (raw.date) flattenedData.date = raw.date;

    // Attach extra flattened props (e.g. stats.attack, etc.) unless advanced rules are controlling all columns
    if (!options.useAdvancedRules) {
      for (const [k, v] of Object.entries(extraFlattenedProps)) {
        flattenedData[k] = v;
      }
    }

    // Process Attributes & Custom Rules
    if (options.useAdvancedRules && options.mappingRules && options.mappingRules.length > 0) {
      const activeRules = options.mappingRules.filter(r => r.enabled);

      for (const rule of activeRules) {
        if (rule.ruleType === 'key_value_attribute') {
          for (const attr of attributes) {
            const traitName = attr.trait_type || 'Unnamed';
            let colName = traitName;
            if (rule.targetColumnFormat === 'property_bracket') colName = `property[${traitName}]`;
            else if (rule.targetColumnFormat === 'number_bracket') colName = `number[${traitName}]`;
            else if (rule.targetColumnFormat === 'boost_percentage_bracket') colName = `boost_percentage[${traitName}]`;
            else if (rule.targetColumnFormat === 'boost_number_bracket') colName = `boost_number[${traitName}]`;
            else if (rule.targetColumnFormat === 'date_bracket') colName = `date[${traitName}]`;
            else if (rule.targetColumnFormat === 'attribute_bracket') colName = `attribute[${traitName}]`;

            const val = applyValueTransforms(attr.value, rule.transform, rule.fallbackValue, rule.prefix, rule.suffix);
            flattenedData[colName] = val;

            if (!traitsMap.has(colName)) {
              traitsMap.set(colName, {
                name: colName,
                inferredDisplayType: attr.display_type || (typeof val === 'number' ? 'number' : 'string'),
                count: 0,
                percentage: 0,
                uniqueValuesCount: 0,
                sampleValues: []
              });
            }
            const tDef = traitsMap.get(colName)!;
            tDef.count += 1;
            const formattedVal = typeof val === 'object' ? JSON.stringify(val) : (val ?? '');
            if (tDef.sampleValues.length < 5 && formattedVal !== '' && !tDef.sampleValues.includes(formattedVal as string | number)) {
              tDef.sampleValues.push(formattedVal as string | number);
            }
          }
        } else {
          // Path extraction for nested objects, nested keys, or arrays
          const rawVal = extractRawPathValue(raw, rule.sourcePath);
          const evalResult = evaluateArrayValue(rawVal, rule.arrayHandling, {
            targetColumn: rule.targetColumn,
            targetFormat: rule.targetColumnFormat,
            customSeparator: rule.customArraySeparator,
            pluckField: rule.pluckField,
            maxUnroll: rule.maxUnrollCount,
            transform: rule.transform,
            fallback: rule.fallbackValue,
            prefix: rule.prefix,
            suffix: rule.suffix
          });

          if (evalResult.isMultipleColumns && evalResult.multipleValues) {
            for (const [colName, val] of Object.entries(evalResult.multipleValues)) {
              flattenedData[colName] = val;
              if (!traitsMap.has(colName)) {
                traitsMap.set(colName, {
                  name: colName,
                  inferredDisplayType: typeof val === 'number' ? 'number' : 'string',
                  count: 0,
                  percentage: 0,
                  uniqueValuesCount: 0,
                  sampleValues: []
                });
              }
              const tDef = traitsMap.get(colName)!;
              tDef.count += 1;
              if (tDef.sampleValues.length < 5 && val !== '' && !tDef.sampleValues.includes(val)) {
                tDef.sampleValues.push(val);
              }
            }
          } else {
            const colName = formatColumnHeader(rule.targetColumn, rule.targetColumnFormat);
            const val = evalResult.singleValue;
            flattenedData[colName] = val;

            if (!traitsMap.has(colName)) {
              let displayType = 'string';
              if (rule.targetColumnFormat === 'number_bracket' || rule.transform === 'number_int' || typeof val === 'number') {
                displayType = 'number';
              } else if (rule.targetColumnFormat === 'boost_percentage_bracket') {
                displayType = 'boost_percentage';
              } else if (rule.targetColumnFormat === 'boost_number_bracket') {
                displayType = 'boost_number';
              } else if (rule.targetColumnFormat === 'date_bracket') {
                displayType = 'date';
              }

              traitsMap.set(colName, {
                name: colName,
                inferredDisplayType: displayType,
                count: 0,
                percentage: 0,
                uniqueValuesCount: 0,
                sampleValues: []
              });
            }
            const tDef = traitsMap.get(colName)!;
            tDef.count += 1;
            if (tDef.sampleValues.length < 5 && val !== '' && !tDef.sampleValues.includes(val)) {
              tDef.sampleValues.push(val);
            }
          }
        }
      }
    } else {
      // Standard automatic extraction
      for (const attr of attributes) {
        const traitName = attr.trait_type || 'Unnamed';
        let colName = traitName;

        if (options.presetFormat === 'opensea') {
          if (attr.display_type === 'number') {
            colName = `number[${traitName}]`;
          } else if (attr.display_type === 'boost_percentage') {
            colName = `boost_percentage[${traitName}]`;
          } else if (attr.display_type === 'boost_number') {
            colName = `boost_number[${traitName}]`;
          } else if (attr.display_type === 'date') {
            colName = `date[${traitName}]`;
          } else {
            colName = `property[${traitName}]`;
          }
        } else if (options.traitHeaderFormat === 'property_bracket') {
          colName = `property[${traitName}]`;
        } else if (options.traitHeaderFormat === 'attribute_bracket') {
          colName = `attribute[${traitName}]`;
        } else if (options.traitHeaderFormat === 'prefix_attr') {
          colName = `attribute_${traitName}`;
        } else if (options.traitHeaderFormat === 'custom_prefix' && options.customTraitPrefix) {
          colName = `${options.customTraitPrefix}${traitName}`;
        }

        flattenedData[colName] = attr.value;

        // Track trait definition & statistics
        if (!traitsMap.has(traitName)) {
          traitsMap.set(traitName, {
            name: traitName,
            inferredDisplayType: attr.display_type || (typeof attr.value === 'number' ? 'number' : 'string'),
            count: 0,
            percentage: 0,
            uniqueValuesCount: 0,
            sampleValues: []
          });
        }
        const tDef = traitsMap.get(traitName)!;
        tDef.count += 1;
        const formattedVal = typeof attr.value === 'object' ? JSON.stringify(attr.value) : (attr.value ?? '');
        if (tDef.sampleValues.length < 5 && formattedVal !== '' && !tDef.sampleValues.includes(formattedVal as string | number)) {
          tDef.sampleValues.push(formattedVal as string | number);
        }
      }
    }

    items.push({
      id: `item-${index}-${tokenId}`,
      itemIndex: index,
      fileName: entry.fileName,
      tokenId,
      raw,
      flattenedData,
      attributes,
      issues
    });
  });

  // Calculate percentages for traits
  const totalTokens = items.length;
  traitsMap.forEach(tDef => {
    tDef.percentage = totalTokens > 0 ? Math.round((tDef.count / totalTokens) * 100) : 0;
  });

  // Calculate stats
  let validTokens = 0;
  let warningTokens = 0;
  let errorTokens = 0;
  let totalIssuesCount = 0;

  for (const item of items) {
    const hasError = item.issues.some(i => i.severity === 'error');
    const hasWarning = item.issues.some(i => i.severity === 'warning');

    if (hasError) errorTokens++;
    else if (hasWarning) warningTokens++;
    else validTokens++;

    totalIssuesCount += item.issues.length;
  }

  const stats: BatchProcessingStats = {
    totalFiles: filesData.length,
    totalTokens,
    validTokens,
    warningTokens,
    errorTokens,
    distinctTraitsCount: traitsMap.size,
    totalIssuesCount
  };

  return { items, allTraits: traitsMap, stats };
}

/**
 * Exports flattened items to standard CSV string with PapaParse
 */
export function generateCSVString(
  items: ParsedNFTItem[],
  options: ConversionOptions,
  traitsMap: Map<string, TraitDefinition>
): string {
  if (items.length === 0) return '';

  // Determine standard base columns
  let baseColumns: string[] = [];
  if (options.presetFormat === 'opensea') {
    baseColumns = [
      'token_id',
      'name',
      'description',
      'image',
      'external_url',
      'animation_url',
      'youtube_url',
      'background_color'
    ];
  } else if (options.presetFormat === 'thirdweb') {
    baseColumns = [
      'name',
      'description',
      'image',
      'animation_url',
      'external_url',
      'background_color'
    ];
  } else {
    baseColumns = [
      'token_id',
      'name',
      'description',
      'image',
      'external_url',
      'animation_url',
      'background_color'
    ];
  }

  // Collect all distinct attribute column names present in flattenedData
  const allDynamicCols = new Set<string>();
  for (const item of items) {
    for (const key of Object.keys(item.flattenedData)) {
      if (!baseColumns.includes(key) && !options.excludedColumns.includes(key)) {
        allDynamicCols.add(key);
      }
    }
  }

  let dynamicColsArray = Array.from(allDynamicCols);
  if (options.sortTraitsAlphabetically) {
    dynamicColsArray.sort((a, b) => a.localeCompare(b));
  }

  // Filter excluded base columns
  const activeBaseCols = baseColumns.filter(c => !options.excludedColumns.includes(c));
  const finalHeaders = [...activeBaseCols, ...dynamicColsArray];

  // Map each item to row data
  const rows = items.map(item => {
    const row: Record<string, any> = {};
    for (const header of finalHeaders) {
      let val = item.flattenedData[header];

      // Format IPFS gateway if specified
      if (header === 'image' || header === 'animation_url') {
        if (typeof val === 'string' && val.startsWith('ipfs://')) {
          const cid = val.replace('ipfs://', '');
          if (options.ipfsGateway === 'cloudflare') {
            val = `https://cloudflare-ipfs.com/ipfs/${cid}`;
          } else if (options.ipfsGateway === 'ipfs_io') {
            val = `https://ipfs.io/ipfs/${cid}`;
          } else if (options.ipfsGateway === 'pinata') {
            val = `https://gateway.pinata.cloud/ipfs/${cid}`;
          } else if (options.ipfsGateway === 'custom' && options.customIpfsGatewayUrl) {
            const gateway = options.customIpfsGatewayUrl.replace(/\/+$/, '');
            val = `${gateway}/${cid}`;
          }
        }
      }

      row[header] = val ?? '';
    }
    return row;
  });

  return Papa.unparse(rows, {
    quotes: options.quoteStyle === 'all' ? true : (options.quoteStyle === 'necessary' ? false : false),
    delimiter: options.csvDelimiter,
    header: options.includeHeader,
    newline: '\r\n'
  });
}

/**
 * Resolves IPFS url for visual display in browser
 */
export function resolveDisplayImageUrl(
  url?: string,
  gateway: 'cloudflare' | 'ipfs_io' | 'pinata' = 'cloudflare'
): string {
  if (!url) return '';
  if (url.startsWith('data:image/')) return url;
  if (url.startsWith('ipfs://')) {
    const cid = url.replace(/^ipfs:\/\//, '');
    const gw = gateway === 'cloudflare' 
      ? 'https://cloudflare-ipfs.com/ipfs/' 
      : gateway === 'pinata' 
        ? 'https://gateway.pinata.cloud/ipfs/' 
        : 'https://ipfs.io/ipfs/';
    return `${gw}${cid}`;
  }
  return url;
}
