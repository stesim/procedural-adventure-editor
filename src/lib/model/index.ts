export type Effect = {
  name : string
}


export type EffectConversion = {
  inputs : Effect[]
  outputs : Effect[]
}


export type Item = {
  name : string
  conversions : EffectConversion[]
}


export type ItemDatabase = {
  name : string
  effects : Effect[]
  items : Item[]
}
