import rosterSeed from './rosterSeed'
import rosterExtra from './rosterExtra'
import pokeIds from './pokeIds'

// Fallback data dipakai saat backend Express belum aktif / request gagal.
// Bentuk data mengikuti response Express + Supabase.

export const artworkUrl = (pokeId) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`

const roleOf = (name) => {
  if (/^Mega .+ Z$/.test(name)) return 'Mega Evolution Z'
  if (name.startsWith('Mega ')) return 'Mega Evolution'
  return 'Standard'
}

// Seed memuat beberapa entri bernama sama (wujud regional), jadi id memakai urutan.
export const dummyRosters = rosterSeed.map(([dex, name], i) => ({
  id: `r-${String(i + 1).padStart(3, '0')}`,
  dex_number: `#${dex}`,
  name,
  ...rosterExtra[i], // type, abilities, stats
  role: roleOf(name),
  description: `${name} tersedia di Pokémon Champions.`,
  image: artworkUrl(pokeIds[i]),
}))

const byName = (name) => dummyRosters.find((r) => r.name === name)

const slot = (name, nature, ability, item, moves) => {
  const r = byName(name)
  return {
    roster_id: r.id,
    name: r.name,
    dex_number: r.dex_number,
    image: r.image,
    nature,
    ability,
    item,
    moves,
  }
}

export const dummyTeams = [
  {
    id: 't-001',
    name: 'Mega Offense',
    description: 'Tim agresif berbasis Mega Evolution.',
    strategy:
      'Pilih 3 dari 6 sesuai tim lawan. Mega Charizard Y dan Garchomp menekan lewat damage tinggi, Incineroar mengatur tempo.',
    members: [
      slot('Mega Charizard Y', 'Timid', 'Drought', 'Charizardite Y', ['Heat Wave', 'Solar Beam', 'Air Slash', 'Protect']),
      slot('Garchomp', 'Jolly', 'Rough Skin', 'Choice Scarf', ['Earthquake', 'Dragon Claw', 'Rock Slide', 'Swords Dance']),
      slot('Incineroar', 'Careful', 'Intimidate', 'Sitrus Berry', ['Fake Out', 'Flare Blitz', 'Parting Shot', 'Knock Off']),
      slot('Gengar', 'Timid', 'Cursed Body', 'Focus Sash', ['Shadow Ball', 'Sludge Bomb', 'Focus Blast', 'Will-O-Wisp']),
      slot('Corviknight', 'Impish', 'Pressure', 'Leftovers', ['Brave Bird', 'Roost', 'Defog', 'Body Press']),
      slot('Dragapult', 'Jolly', 'Infiltrator', 'Life Orb', ['Dragon Darts', 'Shadow Ball', 'U-turn', 'Protect']),
    ],
  },
  {
    id: 't-002',
    name: 'Bulky Balance',
    description: 'Komposisi seimbang dengan pertahanan kuat.',
    strategy: 'Bertahan dengan Snorlax dan Toxapex, lemahkan lawan, lalu selesaikan dengan sweeper.',
    members: [
      slot('Snorlax', 'Careful', 'Thick Fat', 'Leftovers', ['Body Slam', 'Curse', 'Rest', 'Sleep Talk']),
      slot('Toxapex', 'Bold', 'Regenerator', 'Black Sludge', ['Scald', 'Toxic', 'Recover', 'Haze']),
      slot('Mega Metagross', 'Adamant', 'Tough Claws', 'Metagrossite', ['Meteor Mash', 'Zen Headbutt', 'Bullet Punch', 'Earthquake']),
      slot('Sylveon', 'Calm', 'Pixilate', 'Choice Specs', ['Hyper Voice', 'Psyshock', 'Mystical Fire', 'Shadow Ball']),
      slot('Kingambit', 'Adamant', 'Defiant', 'Black Glasses', ['Kowtow Cleave', 'Sucker Punch', 'Iron Head', 'Swords Dance']),
      slot('Rillaboom', 'Adamant', 'Grassy Surge', 'Assault Vest', ['Grassy Glide', 'Wood Hammer', 'Knock Off', 'U-turn']),
    ],
  },
]
