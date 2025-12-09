#!/usr/bin/env ruby
# frozen_string_literal: true

# 🔐 ENOCHIAN KEYS - PGP FORMAT OUTPUT
# Generates keys in the PGP public key block format

require_relative 'generate-enochian-keys'

# Output in PGP format (keys only, no descriptions)
puts "-----BEGIN PGP PUBLIC KEY BLOCK-----"
puts ""

# Output Hidden Two first
HIDDEN_GLYPHS.each do |hidden|
  key = generate_enochian_key(hidden, hidden[:position])
  puts "#{key}  #{hidden[:glyph]}"
end

puts ""

# Output 22 Aramaic letters
ARAMAIC_LETTERS.each do |letter|
  key = generate_enochian_key(letter, letter[:position])
  puts "#{key}  #{letter[:glyph]}"
end

puts ""
puts "-----END PGP PUBLIC KEY BLOCK-----"
