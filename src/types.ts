export interface NFTAttribute {
  trait_type?: string;
  value?: string | number | boolean | Record<string, any> | Array<any>;
  display_type?: 'number' | 'boost_number' | 'boost_percentage' | 'date' | 'ranking' | 'string' | string;
  max_value?: number;
  [key: string]: any;
}

export interface RawNFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  image_url?: string;
  image_data?: string;
  external_url?: string;
  animation_url?: string;
  youtube_url?: string;
  background_color?: string;
  token_id?: string | number;
  tokenId?: string | number;
  id?: string | number;
  edition?: string | number;
  dna?: string;
  compiler?: string;
  date?: number | string;
  attributes?: NFTAttribute[] | Record<string, any>;
  traits?: NFTAttribute[] | Record<string, any>;
  properties?: Record<string, any> | NFTAttribute[];
  [key: string]: any;
}

export type IssueSeverity = 'error' | 'warning' | 'info';

export type ArrayHandlingMode = 
  | 'join_comma'       // "item1, item2"
  | 'join_pipe'        // "item1 | item2"
  | 'join_semicolon'   // "item1; item2"
  | 'join_custom'      // join with custom string
  | 'unroll_columns'   // col_1, col_2, col_3
  | 'first_item'       // col = array[0]
  | 'last_item'        // col = array[last]
  | 'count'            // col = array.length
  | 'json_stringify'   // col = JSON.stringify(array)
  | 'pluck_property';  // pluck specific key from array of objects (e.g. abilities[*].name)

export type ValueTransformType =
  | 'none'
  | 'uppercase'
  | 'lowercase'
  | 'capitalize'
  | 'number_int'
  | 'number_float'
  | 'boolean'
  | 'prefix_suffix';

export type TargetColumnFormat =
  | 'direct'
  | 'property_bracket'
  | 'number_bracket'
  | 'boost_percentage_bracket'
  | 'boost_number_bracket'
  | 'date_bracket'
  | 'attribute_bracket';

export interface MappingRule {
  id: string;
  enabled: boolean;
  name: string;
  ruleType: 'path_extract' | 'key_value_attribute' | 'array_expansion';
  sourcePath: string; // e.g. "stats.elemental.primary", "attributes", "equipment.durability.current", "tags"
  targetColumn: string; // e.g. "Elemental Type", "property[Elemental Type]"
  targetColumnFormat: TargetColumnFormat;
  arrayHandling: ArrayHandlingMode;
  customArraySeparator?: string;
  pluckField?: string;
  maxUnrollCount?: number;
  transform?: ValueTransformType;
  prefix?: string;
  suffix?: string;
  fallbackValue?: string;
  isAutoDiscovered?: boolean;
}

export interface DiscoveredPath {
  path: string;
  sampleValue: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'array_of_objects';
  count: number;
  percentage: number;
  isArray: boolean;
  isNested: boolean;
  sampleTokens: Array<{ tokenId: string | number; value: any }>;
}

export interface ValidationIssue {
  id: string;
  severity: IssueSeverity;
  field: string;
  message: string;
  fixable: boolean;
  fixType?: 'strip_hash' | 'auto_token_id' | 'fallback_name' | 'normalize_ipfs' | 'stringify_nested';
  tokenId?: string | number;
  fileName?: string;
  itemIndex: number;
}

export interface ParsedNFTItem {
  id: string;
  itemIndex: number;
  fileName: string;
  tokenId: string | number;
  raw: RawNFTMetadata;
  flattenedData: Record<string, any>;
  attributes: NFTAttribute[];
  issues: ValidationIssue[];
}

export type CSVPresetFormat = 'opensea' | 'thirdweb' | 'direct_traits' | 'custom';

export interface ConversionOptions {
  presetFormat: CSVPresetFormat;
  traitHeaderFormat: 'property_bracket' | 'attribute_bracket' | 'direct' | 'prefix_attr' | 'custom_prefix';
  customTraitPrefix: string;
  nestedSeparator: '.' | ' > ' | '_' | ' - ' | '/';
  handleNestedObjects: 'flatten_dot' | 'json_string' | 'extract_name';
  tokenIdSource: 'file_name' | 'edition' | 'token_id' | 'auto_0' | 'auto_1' | 'keep_original';
  csvDelimiter: ',' | ';' | '\t' | '|';
  quoteStyle: 'all' | 'necessary' | 'none';
  includeHeader: boolean;
  sortTraitsAlphabetically: boolean;
  cleanHexColors: boolean; // Auto-strip '#' from background_color
  autoFillEmptyNames: boolean; // E.g. "NFT #{id}"
  ipfsGateway: 'raw' | 'cloudflare' | 'ipfs_io' | 'pinata' | 'custom';
  customIpfsGatewayUrl: string;
  excludedColumns: string[];
  // Advanced mapping options
  useAdvancedRules: boolean;
  mappingRules: MappingRule[];
}

export interface TraitDefinition {
  name: string;
  inferredDisplayType: string;
  count: number;
  percentage: number;
  uniqueValuesCount: number;
  sampleValues: Array<string | number>;
  customHeaderName?: string;
  excluded?: boolean;
}

export interface BatchProcessingStats {
  totalFiles: number;
  totalTokens: number;
  validTokens: number;
  warningTokens: number;
  errorTokens: number;
  distinctTraitsCount: number;
  totalIssuesCount: number;
}
