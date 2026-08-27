import { RawNFTMetadata } from '../types';

export interface SampleCollection {
  id: string;
  title: string;
  badge: string;
  description: string;
  data: RawNFTMetadata[];
}

export const SAMPLE_DATASETS: SampleCollection[] = [
  {
    id: 'opensea-creatures',
    title: 'OpenSea Creatures (Full ERC Standards)',
    badge: 'Standard OpenSea',
    description: 'Compliant OpenSea metadata with numeric levels, boost percentages, dates, and background colors.',
    data: [
      {
        token_id: 1,
        name: 'Cyber Kraken #001',
        description: 'A legendary cybernetic ocean behemoth lurking in the digital abyss.',
        image: 'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/1.png',
        external_url: 'https://openseacreatures.io/creature/1',
        animation_url: 'https://storage.googleapis.com/opensea-prod.appspot.com/creature_anim_1.mp4',
        background_color: '0F172A',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        attributes: [
          { trait_type: 'Species', value: 'Kraken' },
          { trait_type: 'Tentacles', value: 'Mechanical Bronze' },
          { trait_type: 'Glow Color', value: 'Bioluminescent Cyan' },
          { trait_type: 'Deep Sea Depth', value: 8500, display_type: 'number' },
          { trait_type: 'Stamina', value: 92, max_value: 100, display_type: 'boost_percentage' },
          { trait_type: 'Aqua Power', value: 8, max_value: 10, display_type: 'boost_number' },
          { trait_type: 'Hatch Date', value: 1672531199, display_type: 'date' },
        ]
      },
      {
        token_id: 2,
        name: 'Aero Leviathan #002',
        description: 'Ancient sky serpent equipped with ion-thruster fins.',
        image: 'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/2.png',
        external_url: 'https://openseacreatures.io/creature/2',
        background_color: '1E293B',
        attributes: [
          { trait_type: 'Species', value: 'Leviathan' },
          { trait_type: 'Wings', value: 'Plasma Gliders' },
          { trait_type: 'Element', value: 'Thunder' },
          { trait_type: 'Speed', value: 98, max_value: 100, display_type: 'boost_percentage' },
          { trait_type: 'Altitude Limit', value: 32000, display_type: 'number' },
          { trait_type: 'Attack Tier', value: 9, max_value: 10, display_type: 'boost_number' },
          { trait_type: 'Hatch Date', value: 1675209600, display_type: 'date' }
        ]
      },
      {
        token_id: 3,
        name: 'Vortex Wyrm #003',
        description: 'A miniature rift wyrm capable of bending space-time currents.',
        image: 'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/3.png',
        external_url: 'https://openseacreatures.io/creature/3',
        background_color: '312E81',
        attributes: [
          { trait_type: 'Species', value: 'Wyrm' },
          { trait_type: 'Horns', value: 'Crystal Obsidian' },
          { trait_type: 'Element', value: 'Void Matter' },
          { trait_type: 'Stamina', value: 74, max_value: 100, display_type: 'boost_percentage' },
          { trait_type: 'Mana Capacity', value: 1200, display_type: 'number' },
          { trait_type: 'Aqua Power', value: 6, max_value: 10, display_type: 'boost_number' },
          { trait_type: 'Hatch Date', value: 1677628800, display_type: 'date' }
        ]
      }
    ]
  },
  {
    id: 'hashlips-art-engine',
    title: 'HashLips 10K Generative Collection',
    badge: 'HashLips / Generative',
    description: 'Generative PFP metadata format containing DNA, edition numbers, and layered attributes.',
    data: [
      {
        dna: '8d2d3a95bf933c061596f7c468e27cbfd62058ba',
        name: 'Pixel Punk #101',
        description: 'Pixel Punk is an exclusive generative NFT collection of 10,000 algorithmic punks.',
        image: 'ipfs://QmZ4jK2x1bJqF6W6C9X2z4Q8r9p3h7v1n8/101.png',
        edition: 101,
        date: 1642858902340,
        compiler: 'HashLips Art Engine',
        attributes: [
          { trait_type: 'Background', value: 'Neon Cyberpunk' },
          { trait_type: 'Skin', value: 'Alien Green' },
          { trait_type: 'Eyes', value: 'Laser Visor Red' },
          { trait_type: 'Mouth', value: 'Bubblegum Pink' },
          { trait_type: 'Headwear', value: 'Holographic Fedora' },
          { trait_type: 'Earring', value: 'Gold Cross' }
        ]
      },
      {
        dna: '3f59e0a1c72b8d94e105c3b991a7d6e492f183c2',
        name: 'Pixel Punk #102',
        description: 'Pixel Punk is an exclusive generative NFT collection of 10,000 algorithmic punks.',
        image: 'ipfs://QmZ4jK2x1bJqF6W6C9X2z4Q8r9p3h7v1n8/102.png',
        edition: 102,
        date: 1642858904512,
        compiler: 'HashLips Art Engine',
        attributes: [
          { trait_type: 'Background', value: 'Midnight City' },
          { trait_type: 'Skin', value: 'Cyborg Silver' },
          { trait_type: 'Eyes', value: 'Night Vision Goggles' },
          { trait_type: 'Mouth', value: 'Vape Smoke' },
          { trait_type: 'Headwear', value: 'Beanie Orange' },
          { trait_type: 'Clothing', value: 'Tactical Vest' }
        ]
      },
      {
        dna: '9a71b2d4c83e104f569a7b8c2d3e4f5a6b7c8d9e',
        name: 'Pixel Punk #103',
        description: 'Pixel Punk is an exclusive generative NFT collection of 10,000 algorithmic punks.',
        image: 'ipfs://QmZ4jK2x1bJqF6W6C9X2z4Q8r9p3h7v1n8/103.png',
        edition: 103,
        date: 1642858906981,
        compiler: 'HashLips Art Engine',
        attributes: [
          { trait_type: 'Background', value: 'Solar Flare' },
          { trait_type: 'Skin', value: 'Warm Amber' },
          { trait_type: 'Eyes', value: 'Hypno Spiral' },
          { trait_type: 'Mouth', value: 'Smirk Toothpick' },
          { trait_type: 'Headwear', value: 'Samurai Topknot' },
          { trait_type: 'Accessory', value: 'Cyber Katana' }
        ]
      }
    ]
  },
  {
    id: 'nested-rpg-gaming',
    title: 'RPG Gaming Items (Deep Nested Objects)',
    badge: 'Nested Attributes',
    description: 'Complex game metadata with multi-tier nested stats, equipment slots, durability, and skill trees.',
    data: [
      {
        id: 'ITEM-8801',
        name: 'Excalibur: Void Cleaver',
        description: 'Mythic greatsword imbued with dimensional rift energy.',
        image: 'ipfs://QmPZ4Gv7YqK6N9x2z5H8r1p3h7v1n8/8801.png',
        external_url: 'https://aether-rpg.io/armory/8801',
        background_color: '1E1B4B',
        stats: {
          attack_power: 1450,
          crit_chance: 34.5,
          speed: 1.2,
          elemental: {
            primary: 'Void',
            damage_bonus: '+45%',
            inflict_status: 'Decay'
          }
        },
        equipment: {
          slot: 'Two-Handed',
          tier: 'Mythic VI',
          durability: {
            current: 450,
            max: 500
          },
          requirements: {
            strength: 85,
            level: 60
          }
        },
        lore: {
          forged_by: 'Hephaestus AI',
          realm_of_origin: 'Tartarus Sector 9'
        },
        attributes: [
          { trait_type: 'Rarity', value: 'Mythic' },
          { trait_type: 'Weapon Class', value: 'Greatsword' },
          { trait_type: 'Enchantment', value: 'Dimensional Tear' }
        ]
      },
      {
        id: 'ITEM-8802',
        name: 'Aegis of the Solar Vanguard',
        description: 'Hardlight barrier shield reflecting kinetic projectiles.',
        image: 'ipfs://QmPZ4Gv7YqK6N9x2z5H8r1p3h7v1n8/8802.png',
        external_url: 'https://aether-rpg.io/armory/8802',
        background_color: '451A03',
        stats: {
          defense_armor: 980,
          block_rate: 62.0,
          speed: -0.1,
          elemental: {
            primary: 'Solar Flame',
            damage_bonus: '+20%',
            inflict_status: 'Burn'
          }
        },
        equipment: {
          slot: 'Off-Hand',
          tier: 'Legendary IV',
          durability: {
            current: 800,
            max: 800
          },
          requirements: {
            defense: 70,
            level: 55
          }
        },
        lore: {
          forged_by: 'Solar Guild Master',
          realm_of_origin: 'Helios Citadel'
        },
        attributes: [
          { trait_type: 'Rarity', value: 'Legendary' },
          { trait_type: 'Weapon Class', value: 'Heavy Shield' },
          { trait_type: 'Enchantment', value: 'Solar Flare Rebound' }
        ]
      }
    ]
  },
  {
    id: 'validation-test-case',
    title: 'Edge Cases & Validation Fixer Suite',
    badge: 'Validation Test',
    description: 'Metadata with common formatting errors (duplicate IDs, # in hex colors, missing images, invalid display types) to test the error log.',
    data: [
      {
        tokenId: 1,
        name: '',
        description: 'Token with missing name and invalid hex background color.',
        image: 'ipfs://QmInvalid/1.png',
        background_color: '#FF5500', // Invalid: contains '#'
        attributes: [
          { trait_type: 'Power Level', value: 'Over 9000', display_type: 'boost_number' }, // Invalid: string value for boost_number
          { trait_type: 'Color', value: 'Crimson' }
        ]
      },
      {
        tokenId: 1, // Duplicate token ID 1
        name: 'Ghost Item #002',
        description: 'Token with missing image and broken trait without value.',
        image: '', // Missing image error
        background_color: 'ZZZZZZ', // Invalid hex code
        attributes: [
          { trait_type: 'Empty Trait' }, // Missing value
          { trait_type: 'Health', value: 120, max_value: 100, display_type: 'boost_percentage' } // Value > max_value
        ]
      },
      {
        tokenId: 3,
        name: 'Valid Robo #003',
        description: 'Clean token following all OpenSea specifications.',
        image: 'ipfs://QmValidHash778/3.png',
        background_color: '000000',
        attributes: [
          { trait_type: 'Chassis', value: 'Titanium' },
          { trait_type: 'Level', value: 5, display_type: 'number' }
        ]
      }
    ]
  }
];
