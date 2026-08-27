import { 
  RawNFTMetadata, 
  MappingRule, 
  DiscoveredPath, 
  ArrayHandlingMode, 
  ValueTransformType,
  TargetColumnFormat,
  NFTAttribute 
} from '../types';

/**
 * Traverses a JavaScript object using a dot-path (with optional array indices like [0] or [*])
 */
export function extractRawPathValue(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object' || !path) return undefined;

  // Split path while respecting bracket notation e.g. "skills[0].name" -> ["skills", "0", "name"]
  // or "tags[*]" -> ["tags", "*"]
  const normalizedPath = path
    .replace(/\[(\w+|\*)\]/g, '.$1')
    .replace(/^\./, '');

  const segments = normalizedPath.split('.').filter(Boolean);
  let current: any = obj;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];

    if (current === null || current === undefined) {
      return undefined;
    }

    if (seg === '*') {
      // Wildcard traversal on array
      if (Array.isArray(current)) {
        const remainingPath = segments.slice(i + 1).join('.');
        if (!remainingPath) {
          return current;
        }
        return current.map(item => extractRawPathValue(item, remainingPath)).filter(v => v !== undefined);
      }
      return undefined;
    }

    // Number index for array
    if (/^\d+$/.test(seg) && Array.isArray(current)) {
      current = current[parseInt(seg, 10)];
    } else {
      current = current[seg];
    }
  }

  return current;
}

/**
 * Transforms a raw value according to type coercion and prefix/suffix rules
 */
export function applyValueTransforms(
  value: any,
  transform?: ValueTransformType,
  fallback?: string,
  prefix?: string,
  suffix?: string
): any {
  if (value === null || value === undefined || value === '') {
    if (fallback !== undefined && fallback !== '') {
      return fallback;
    }
    return '';
  }

  let str = String(value);

  if (transform === 'uppercase') {
    str = str.toUpperCase();
  } else if (transform === 'lowercase') {
    str = str.toLowerCase();
  } else if (transform === 'capitalize') {
    str = str.replace(/\b\w/g, char => char.toUpperCase());
  } else if (transform === 'number_int') {
    const num = parseInt(str.replace(/[^0-9.-]/g, ''), 10);
    return isNaN(num) ? (fallback || '') : num;
  } else if (transform === 'number_float') {
    const num = parseFloat(str.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? (fallback || '') : num;
  } else if (transform === 'boolean') {
    const lower = str.toLowerCase().trim();
    return lower === 'true' || lower === '1' || lower === 'yes';
  }

  if (prefix) {
    str = `${prefix}${str}`;
  }
  if (suffix) {
    str = `${str}${suffix}`;
  }

  return str;
}

/**
 * Formats a target column header according to OpenSea or custom standards
 */
export function formatColumnHeader(name: string, format: TargetColumnFormat): string {
  const cleanName = name.trim();
  switch (format) {
    case 'property_bracket':
      return `property[${cleanName}]`;
    case 'number_bracket':
      return `number[${cleanName}]`;
    case 'boost_percentage_bracket':
      return `boost_percentage[${cleanName}]`;
    case 'boost_number_bracket':
      return `boost_number[${cleanName}]`;
    case 'date_bracket':
      return `date[${cleanName}]`;
    case 'attribute_bracket':
      return `attribute[${cleanName}]`;
    case 'direct':
    default:
      return cleanName;
  }
}

/**
 * Evaluates an Array against the specified ArrayHandlingMode
 * Can return either a single value or an object with multiple unrolled columns
 */
export function evaluateArrayValue(
  arr: any[],
  mode: ArrayHandlingMode,
  options: {
    targetColumn: string;
    targetFormat: TargetColumnFormat;
    customSeparator?: string;
    pluckField?: string;
    maxUnroll?: number;
    transform?: ValueTransformType;
    fallback?: string;
    prefix?: string;
    suffix?: string;
  }
): { isMultipleColumns: boolean; singleValue?: any; multipleValues?: Record<string, any> } {
  if (!Array.isArray(arr)) {
    const transformed = applyValueTransforms(arr, options.transform, options.fallback, options.prefix, options.suffix);
    return { isMultipleColumns: false, singleValue: transformed };
  }

  if (arr.length === 0) {
    return { isMultipleColumns: false, singleValue: options.fallback || '' };
  }

  // If pluck_property is requested on an array of objects
  let processedItems = arr;
  if (options.pluckField) {
    processedItems = arr.map(item => {
      if (item && typeof item === 'object') {
        return extractRawPathValue(item, options.pluckField!);
      }
      return item;
    }).filter(v => v !== undefined);
  }

  switch (mode) {
    case 'join_pipe': {
      const joined = processedItems
        .map(i => typeof i === 'object' ? JSON.stringify(i) : String(i))
        .join(' | ');
      return { 
        isMultipleColumns: false, 
        singleValue: applyValueTransforms(joined, options.transform, options.fallback, options.prefix, options.suffix) 
      };
    }
    case 'join_semicolon': {
      const joined = processedItems
        .map(i => typeof i === 'object' ? JSON.stringify(i) : String(i))
        .join('; ');
      return { 
        isMultipleColumns: false, 
        singleValue: applyValueTransforms(joined, options.transform, options.fallback, options.prefix, options.suffix) 
      };
    }
    case 'join_custom': {
      const sep = options.customSeparator ?? ', ';
      const joined = processedItems
        .map(i => typeof i === 'object' ? JSON.stringify(i) : String(i))
        .join(sep);
      return { 
        isMultipleColumns: false, 
        singleValue: applyValueTransforms(joined, options.transform, options.fallback, options.prefix, options.suffix) 
      };
    }
    case 'first_item': {
      const item = processedItems[0];
      const val = typeof item === 'object' ? JSON.stringify(item) : item;
      return { 
        isMultipleColumns: false, 
        singleValue: applyValueTransforms(val, options.transform, options.fallback, options.prefix, options.suffix) 
      };
    }
    case 'last_item': {
      const item = processedItems[processedItems.length - 1];
      const val = typeof item === 'object' ? JSON.stringify(item) : item;
      return { 
        isMultipleColumns: false, 
        singleValue: applyValueTransforms(val, options.transform, options.fallback, options.prefix, options.suffix) 
      };
    }
    case 'count': {
      return { 
        isMultipleColumns: false, 
        singleValue: processedItems.length 
      };
    }
    case 'json_stringify': {
      return { 
        isMultipleColumns: false, 
        singleValue: JSON.stringify(processedItems) 
      };
    }
    case 'unroll_columns': {
      const max = options.maxUnroll || 5;
      const res: Record<string, any> = {};
      const baseCol = options.targetColumn;

      for (let i = 0; i < max; i++) {
        const headerName = formatColumnHeader(`${baseCol}_${i + 1}`, options.targetFormat);
        const itemVal = processedItems[i];
        if (itemVal !== undefined) {
          const val = typeof itemVal === 'object' ? JSON.stringify(itemVal) : itemVal;
          res[headerName] = applyValueTransforms(val, options.transform, options.fallback, options.prefix, options.suffix);
        } else {
          res[headerName] = options.fallback || '';
        }
      }
      return { isMultipleColumns: true, multipleValues: res };
    }
    case 'pluck_property':
    case 'join_comma':
    default: {
      const joined = processedItems
        .map(i => typeof i === 'object' ? JSON.stringify(i) : String(i))
        .join(', ');
      return { 
        isMultipleColumns: false, 
        singleValue: applyValueTransforms(joined, options.transform, options.fallback, options.prefix, options.suffix) 
      };
    }
  }
}

/**
 * Discovers all nested object paths, array fields, and primitive properties across an entire collection
 */
export function discoverAllNestedPaths(rawItems: RawNFTMetadata[]): DiscoveredPath[] {
  const pathMap = new Map<string, {
    count: number;
    types: Set<string>;
    sampleValues: any[];
    isArray: boolean;
    isNested: boolean;
    sampleTokens: Array<{ tokenId: string | number; value: any }>;
  }>();

  const standardIgnoredPaths = new Set([
    'name', 'description', 'image', 'image_url', 'image_data', 'external_url',
    'animation_url', 'youtube_url', 'background_color', 'token_id', 'tokenId',
    'id', 'edition', 'dna', 'compiler', 'date'
  ]);

  const traverse = (obj: any, currentPath: string, tokenId: string | number) => {
    if (!obj || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
      if (!pathMap.has(currentPath)) {
        pathMap.set(currentPath, {
          count: 0,
          types: new Set(),
          sampleValues: [],
          isArray: true,
          isNested: currentPath.includes('.'),
          sampleTokens: []
        });
      }
      const entry = pathMap.get(currentPath)!;
      entry.count += 1;
      entry.isArray = true;

      if (obj.length > 0) {
        const first = obj[0];
        if (typeof first === 'object' && first !== null) {
          entry.types.add('array_of_objects');
          // Also discover nested properties inside objects of this array e.g. abilities[*].name
          if (obj.length > 0 && typeof obj[0] === 'object') {
            for (const key of Object.keys(obj[0])) {
              traverse(obj.map(item => item?.[key]), `${currentPath}[*].${key}`, tokenId);
            }
          }
        } else {
          entry.types.add('array');
        }
        if (entry.sampleValues.length < 3) {
          entry.sampleValues.push(obj);
        }
        if (entry.sampleTokens.length < 3) {
          entry.sampleTokens.push({ tokenId, value: obj });
        }
      }
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      const nextPath = currentPath ? `${currentPath}.${key}` : key;

      if (value === null || value === undefined) continue;

      if (typeof value === 'object' && !(value instanceof Date)) {
        // Record intermediate object path
        if (!pathMap.has(nextPath)) {
          pathMap.set(nextPath, {
            count: 0,
            types: new Set([Array.isArray(value) ? 'array' : 'object']),
            sampleValues: [],
            isArray: Array.isArray(value),
            isNested: nextPath.includes('.'),
            sampleTokens: []
          });
        }
        const objEntry = pathMap.get(nextPath)!;
        objEntry.count += 1;

        traverse(value, nextPath, tokenId);
      } else {
        // Primitive value
        if (!pathMap.has(nextPath)) {
          pathMap.set(nextPath, {
            count: 0,
            types: new Set(),
            sampleValues: [],
            isArray: false,
            isNested: nextPath.includes('.'),
            sampleTokens: []
          });
        }
        const entry = pathMap.get(nextPath)!;
        entry.count += 1;
        entry.types.add(typeof value);
        if (entry.sampleValues.length < 3 && !entry.sampleValues.includes(value)) {
          entry.sampleValues.push(value);
        }
        if (entry.sampleTokens.length < 3) {
          entry.sampleTokens.push({ tokenId, value });
        }
      }
    }
  };

  rawItems.forEach((raw, idx) => {
    const tokenId = raw.token_id ?? raw.tokenId ?? raw.id ?? raw.edition ?? (idx + 1);
    traverse(raw, '', tokenId);
  });

  const total = rawItems.length;
  const result: DiscoveredPath[] = [];

  for (const [path, info] of pathMap.entries()) {
    // Determine prominent type
    let inferredType: DiscoveredPath['type'] = 'string';
    if (info.types.has('array_of_objects')) inferredType = 'array_of_objects';
    else if (info.isArray || info.types.has('array')) inferredType = 'array';
    else if (info.types.has('number')) inferredType = 'number';
    else if (info.types.has('boolean')) inferredType = 'boolean';
    else if (info.types.has('object')) inferredType = 'object';

    result.push({
      path,
      sampleValue: info.sampleValues[0] ?? '',
      type: inferredType,
      count: info.count,
      percentage: total > 0 ? Math.round((info.count / total) * 100) : 0,
      isArray: info.isArray,
      isNested: info.isNested,
      sampleTokens: info.sampleTokens
    });
  }

  // Sort by nesting level and count
  return result.sort((a, b) => b.count - a.count || a.path.localeCompare(b.path));
}

/**
 * Standard Default Mapping Rule Templates
 */
export const PRESET_MAPPING_RULES: Record<string, { title: string; description: string; rules: MappingRule[] }> = {
  opensea_standard: {
    title: 'Standard OpenSea Key-Value Attributes',
    description: 'Extracts attributes array with trait_type as column header and value as cell content wrapped in OpenSea standard format.',
    rules: [
      {
        id: 'rule_opensea_kv',
        enabled: true,
        name: 'Standard Key-Value Attributes',
        ruleType: 'key_value_attribute',
        sourcePath: 'attributes',
        targetColumn: 'attributes',
        targetColumnFormat: 'property_bracket',
        arrayHandling: 'join_comma',
        transform: 'none'
      }
    ]
  },
  rpg_game_items: {
    title: 'RPG Game Items & Deep Nested Stats',
    description: 'Extracts elemental damage, attack power, durability, equipment slot, and lore fields from nested objects into individual CSV columns.',
    rules: [
      {
        id: 'rule_rpg_attack',
        enabled: true,
        name: 'Attack Power',
        ruleType: 'path_extract',
        sourcePath: 'stats.attack_power',
        targetColumn: 'Attack Power',
        targetColumnFormat: 'number_bracket',
        arrayHandling: 'first_item',
        transform: 'number_int'
      },
      {
        id: 'rule_rpg_defense',
        enabled: true,
        name: 'Defense Armor',
        ruleType: 'path_extract',
        sourcePath: 'stats.defense_armor',
        targetColumn: 'Defense Armor',
        targetColumnFormat: 'number_bracket',
        arrayHandling: 'first_item',
        transform: 'number_int',
        fallbackValue: '0'
      },
      {
        id: 'rule_rpg_element',
        enabled: true,
        name: 'Primary Element',
        ruleType: 'path_extract',
        sourcePath: 'stats.elemental.primary',
        targetColumn: 'Primary Element',
        targetColumnFormat: 'property_bracket',
        arrayHandling: 'first_item',
        transform: 'capitalize'
      },
      {
        id: 'rule_rpg_damage_bonus',
        enabled: true,
        name: 'Damage Bonus %',
        ruleType: 'path_extract',
        sourcePath: 'stats.elemental.damage_bonus',
        targetColumn: 'Damage Bonus',
        targetColumnFormat: 'property_bracket',
        arrayHandling: 'first_item',
        transform: 'none'
      },
      {
        id: 'rule_rpg_equipment_slot',
        enabled: true,
        name: 'Equipment Slot',
        ruleType: 'path_extract',
        sourcePath: 'equipment.slot',
        targetColumn: 'Slot',
        targetColumnFormat: 'property_bracket',
        arrayHandling: 'first_item',
        transform: 'none'
      },
      {
        id: 'rule_rpg_durability',
        enabled: true,
        name: 'Durability (Current/Max)',
        ruleType: 'path_extract',
        sourcePath: 'equipment.durability.current',
        targetColumn: 'Durability',
        targetColumnFormat: 'number_bracket',
        arrayHandling: 'first_item',
        transform: 'number_int'
      },
      {
        id: 'rule_rpg_forged_by',
        enabled: true,
        name: 'Forged By (Lore)',
        ruleType: 'path_extract',
        sourcePath: 'lore.forged_by',
        targetColumn: 'Forged By',
        targetColumnFormat: 'property_bracket',
        arrayHandling: 'first_item',
        transform: 'none'
      }
    ]
  },
  array_showcase: {
    title: 'Array Handling (Comma Join & Unroll Columns)',
    description: 'Demonstrates joining array items with custom separators and unrolling array elements into indexed columns (tag_1, tag_2, tag_3).',
    rules: [
      {
        id: 'rule_array_join',
        enabled: true,
        name: 'Tags / Categories (Joined with Pipe)',
        ruleType: 'path_extract',
        sourcePath: 'tags',
        targetColumn: 'Tags',
        targetColumnFormat: 'direct',
        arrayHandling: 'join_pipe',
        transform: 'none'
      },
      {
        id: 'rule_array_unroll',
        enabled: true,
        name: 'Skills (Unrolled Columns: Skill_1, Skill_2)',
        ruleType: 'path_extract',
        sourcePath: 'skills',
        targetColumn: 'Skill',
        targetColumnFormat: 'property_bracket',
        arrayHandling: 'unroll_columns',
        maxUnrollCount: 3,
        transform: 'capitalize'
      }
    ]
  }
};
