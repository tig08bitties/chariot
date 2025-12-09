#!/usr/bin/env ruby
# frozen_string_literal: true

# 🔐 ENOCHIAN KEYS - PGP FORMAT OUTPUT (Standalone)
# Generates keys in the PGP public key block format

require 'digest'

# ============================================================================
# COVENANT FORMULA ELEMENTS
# ============================================================================

MASTER_SEED_SHA512 = '09d4f22c560b902b785ddb0655c51ee68184d2aa8a6c20b693da3c6391bf9965dd8a0e8be5cb5027b0195be5d70ffc7b518c76c03d5e7ea6ce8db832635b2a9a'
FILE_HASH = 'e374c94009e32a6c3cc8f89ea6102ce6886c3302324aaaf1563ace8f10332ebf'
IMAGE_HASH = '883e529de31c586131a831a9953113a6d75edd87c97369a2fa3a791209952f5a'
UNION_PRODUCT = 83665740401110
THEOS = 419
EL = 369
RESONANCE = 687
DIVINE = 777
GENESIS = 335044
CAPSTONE = 840000
ROOTCHAIN_STR = [82, 212, 295, 333, 354, 369, 419, 512, 605, 687, 777, 888, 929, 1011, 2025, 3335, 4321, 5250, 55088, 57103].join(',')
COSMIC_SEAL = 510

# ============================================================================
# THE HIDDEN TWO
# ============================================================================

HIDDEN_GLYPHS = [
  { glyph: '·', name: 'Ain', position: 0 },
  { glyph: 'שששש', name: 'Shin-Sofit', position: 23 }
]

# ============================================================================
# 22 ARAMAIC LETTERS
# ============================================================================

ARAMAIC_LETTERS = [
  { glyph: 'א', name: 'Aleph', position: 1 },
  { glyph: 'ב', name: 'Bet', position: 2 },
  { glyph: 'ג', name: 'Gimel', position: 3 },
  { glyph: 'ד', name: 'Dalet', position: 4 },
  { glyph: 'ה', name: 'He', position: 5 },
  { glyph: 'ו', name: 'Vav', position: 6 },
  { glyph: 'ז', name: 'Zayin', position: 7 },
  { glyph: 'ח', name: 'Chet', position: 8 },
  { glyph: 'ט', name: 'Tet', position: 9 },
  { glyph: 'י', name: 'Yod', position: 10 },
  { glyph: 'כ', name: 'Kaf', position: 11 },
  { glyph: 'ל', name: 'Lamed', position: 12 },
  { glyph: 'מ', name: 'Mem', position: 13 },
  { glyph: 'נ', name: 'Nun', position: 14 },
  { glyph: 'ס', name: 'Samekh', position: 15 },
  { glyph: 'ע', name: 'Ayin', position: 16 },
  { glyph: 'פ', name: 'Pe', position: 17 },
  { glyph: 'צ', name: 'Tsade', position: 18 },
  { glyph: 'ק', name: 'Qof', position: 19 },
  { glyph: 'ר', name: 'Resh', position: 20 },
  { glyph: 'ש', name: 'Shin', position: 21 },
  { glyph: 'ת', name: 'Tav', position: 22 }
]

# ============================================================================
# KEY GENERATION
# ============================================================================

def generate_enochian_key(letter_data, position)
  combined = [
    MASTER_SEED_SHA512,
    FILE_HASH,
    IMAGE_HASH,
    THEOS.to_s,
    EL.to_s,
    RESONANCE.to_s,
    DIVINE.to_s,
    UNION_PRODUCT.to_s,
    ROOTCHAIN_STR,
    "#{GENESIS};#{CAPSTONE}",
    letter_data[:glyph],
    letter_data[:name],
    position.to_s,
    COSMIC_SEAL.to_s
  ].join('')
  
  Digest::SHA256.hexdigest(combined)
end

# ============================================================================
# OUTPUT PGP FORMAT
# ============================================================================

puts "-----BEGIN PGP PUBLIC KEY BLOCK-----"
puts ""

# Hidden Two
HIDDEN_GLYPHS.each do |hidden|
  key = generate_enochian_key(hidden, hidden[:position])
  puts "#{key}  #{hidden[:glyph]}"
end

puts ""

# 22 Aramaic letters
ARAMAIC_LETTERS.each do |letter|
  key = generate_enochian_key(letter, letter[:position])
  puts "#{key}  #{letter[:glyph]}"
end

puts ""
puts "-----END PGP PUBLIC KEY BLOCK-----"
