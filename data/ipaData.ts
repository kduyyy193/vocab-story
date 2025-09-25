import { IpaSymbol } from '../types';

export const ipaData: IpaSymbol[] = [
  // Vowels
  { symbol: 'iː', type: 'vowel', exampleWord: 'see', description: 'Long "ee" sound. Tongue high and front.' },
  { symbol: 'ɪ', type: 'vowel', exampleWord: 'sit', description: 'Short "i" sound. Tongue slightly lower than for /iː/.' },
  { symbol: 'e', type: 'vowel', exampleWord: 'bed', description: 'Short "e" sound. Tongue mid-height and front.' },
  { symbol: 'æ', type: 'vowel', exampleWord: 'cat', description: '"a" sound as in apple. Mouth wide open.' },
  { symbol: 'ɑː', type: 'vowel', exampleWord: 'father', description: 'Long "ah" sound. Tongue low and back.' },
  { symbol: 'ɒ', type: 'vowel', exampleWord: 'hot', description: 'Short "o" sound. Lips rounded.' },
  { symbol: 'ɔː', type: 'vowel', exampleWord: 'saw', description: 'Long "aw" sound. Lips more rounded than /ɒ/.' },
  { symbol: 'ʊ', type: 'vowel', exampleWord: 'put', description: 'Short "u" sound. Back of the tongue is raised.' },
  { symbol: 'uː', type: 'vowel', exampleWord: 'blue', description: 'Long "oo" sound. Lips very rounded.' },
  { symbol: 'ʌ', type: 'vowel', exampleWord: 'cup', description: 'Short "u" sound as in "but". Tongue central.' },
  { symbol: 'ɜː', type: 'vowel', exampleWord: 'fur', description: 'Long "er" sound. Tongue central and mid-height.' },
  { symbol: 'ə', type: 'vowel', exampleWord: 'about', description: 'Schwa sound. Unstressed, weak vowel.' },
  // Diphthongs
  { symbol: 'eɪ', type: 'diphthong', exampleWord: 'say', description: 'Starts as /e/ and glides to /ɪ/.' },
  { symbol: 'aɪ', type: 'diphthong', exampleWord: 'my', description: 'Starts as /a/ and glides to /ɪ/.' },
  { symbol: 'ɔɪ', type: 'diphthong', exampleWord: 'boy', description: 'Starts as /ɔ/ and glides to /ɪ/.' },
  { symbol: 'əʊ', type: 'diphthong', exampleWord: 'go', description: 'Starts as /ə/ and glides to /ʊ/.' },
  { symbol: 'aʊ', type: 'diphthong', exampleWord: 'now', description: 'Starts as /a/ and glides to /ʊ/.' },
  // Consonants
  { symbol: 'p', type: 'consonant', exampleWord: 'pen', description: 'Voiceless bilabial plosive. Puff of air.' },
  { symbol: 'b', type: 'consonant', exampleWord: 'bad', description: 'Voiced bilabial plosive. Vocal cords vibrate.' },
  { symbol: 't', type: 'consonant', exampleWord: 'tea', description: 'Voiceless alveolar plosive. Tongue tip on alveolar ridge.' },
  { symbol: 'd', type: 'consonant', exampleWord: 'did', description: 'Voiced alveolar plosive.' },
  { symbol: 'k', type: 'consonant', exampleWord: 'cat', description: 'Voiceless velar plosive. Back of tongue on soft palate.' },
  { symbol: 'g', type: 'consonant', exampleWord: 'go', description: 'Voiced velar plosive.' },
];