#!/usr/bin/env ruby
# frozen_string_literal: true

# 🔐 ENOCHIAN KEYS - JSON OUTPUT
# Generates keys in JSON format for programmatic use

require 'json'
require_relative 'generate-enochian-keys'

def generate_keys_json
  keys = {
    covenant: {
      master_seed_source: MASTER_SEED_SOURCE,
      master_seed_sha512: MASTER_SEED_SHA512,
      file_hash: FILE_HASH,
      image_hash: IMAGE_HASH,
      union_product: UNION_PRODUCT,
      constants: {
        theos: THEOS,
        el: EL,
        resonance: RESONANCE,
        divine: DIVINE
      },
      rootchain: ROOTCHAIN,
      anchor: {
        genesis: GENESIS,
        capstone: CAPSTONE
      },
      cosmic_seal: COSMIC_SEAL
    },
    hidden_glyphs: [],
    aramaic_letters: []
  }
  
  # Generate keys for hidden glyphs
  HIDDEN_GLYPHS.each do |hidden|
    key = generate_enochian_key(hidden, hidden[:position])
    keys[:hidden_glyphs] << {
      position: hidden[:position],
      glyph: hidden[:glyph],
      name: hidden[:name],
      aramaic_name: hidden[:aramaic_name],
      meaning: hidden[:meaning],
      description: hidden[:description],
      enochian_key: key
    }
  end
  
  # Generate keys for Aramaic letters
  ARAMAIC_LETTERS.each do |letter|
    key = generate_enochian_key(letter, letter[:position])
    keys[:aramaic_letters] << {
      position: letter[:position],
      glyph: letter[:glyph],
      name: letter[:name],
      meaning: letter[:meaning],
      enochian_key: key
    }
  end
  
  keys
end

# Output JSON
puts JSON.pretty_generate(generate_keys_json)
