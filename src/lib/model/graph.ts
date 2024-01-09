abstract class GraphNode {
  private _references = new Map<symbol, GraphNode[]>()


  _add_reference(tag : symbol, source : GraphNode) : void {
    let tag_references = this._references.get(tag)
    if (tag_references === undefined) {
      tag_references = []
      this._references.set(tag, tag_references)
    }
    tag_references.push(source)
  }


  _remove_reference(tag : symbol, source : GraphNode) : void {
    let tag_references = this._references.get(tag)
    if (tag_references !== undefined) {
      const index = tag_references.indexOf(source)
      if (index >= 0) {
        tag_references.splice(index, 1)
      }
    }
  }


  _clear_references() : void {
    for (const [tag, sources] of this._references.entries()) {
      for (const source of sources) {
        source._detach_reference(tag, this)
      }
    }
  }


  protected _detach_reference(tag : symbol, target : GraphNode) : void {
  }
}


export class Tag extends GraphNode {
  constructor(public name : string = "") {
    super()
  }
}


export class Effect extends GraphNode {
  constructor(public name : string = "") {
    super()
  }
}


export class EffectConversion extends GraphNode {
  static TAGS = Symbol("tags")

  private _tags = new Set<Tag>()

  get tags() : ReadonlySet<Tag> { return this._tags }

  tags_add(value : Tag) : void {
    this._tags.add(value)
    value._add_reference(EffectConversion.TAGS, this)
  }

  tags_remove(value : Tag) : void {
    if (this._tags.delete(value)) {
      value._remove_reference(EffectConversion.TAGS, this)
    }
  }


  static INPUTS = Symbol("inputs")

  private _inputs = new Set<Effect>()

  get inputs() : ReadonlySet<Effect> { return this._inputs }

  inputs_add(value : Effect) : void {
    this._inputs.add(value)
    value._add_reference(EffectConversion.INPUTS, this)
  }

  inputs_remove(value : Effect) : void {
    if (this._inputs.delete(value)) {
      value._remove_reference(EffectConversion.INPUTS, this)
    }
  }


  static OUTPUTS = Symbol("outputs")

  private _outputs = new Set<Effect>()

  get outputs() : ReadonlySet<Effect> { return this._outputs }

  outputs_add(value : Effect) : void {
    this._outputs.add(value)
    value._add_reference(EffectConversion.OUTPUTS, this)
  }

  outputs_remove(value : Effect) : void {
    if (this._outputs.delete(value)) {
      value._remove_reference(EffectConversion.OUTPUTS, this)
    }
  }


  protected _detach_reference(tag : symbol, target : GraphNode) : void {
    switch (tag) {
      case EffectConversion.TAGS: this._tags.delete(target as Tag); break;
      case EffectConversion.INPUTS: this._inputs.delete(target as Effect); break;
      case EffectConversion.OUTPUTS: this._outputs.delete(target as Effect); break;
    }
  }
}


export class Item extends GraphNode {
  static TAGS = Symbol("tags")

  private _tags = new Set<Tag>()

  get tags() : ReadonlySet<Tag> { return this._tags }

  tags_add(value : Tag) : void {
    this._tags.add(value)
    value._add_reference(Item.TAGS, this)
  }

  tags_remove(value : Tag) : void {
    if (this._tags.delete(value)) {
      value._remove_reference(Item.TAGS, this)
    }
  }


  static CONVERSIONS = Symbol("conversions")

  private _conversions = new Set<EffectConversion>()

  get conversions() : ReadonlySet<EffectConversion> { return this._conversions }

  conversions_add(value : EffectConversion) : void {
    this._conversions.add(value)
    value._add_reference(Item.CONVERSIONS, this)
  }

  conversions_remove(value : EffectConversion) : void {
    if (this._conversions.delete(value)) {
      value._remove_reference(Item.CONVERSIONS, this)
    }
  }


  constructor(public name : string = "", public image : File | undefined = undefined) {
    super()
  }


  protected _detach_reference(tag : symbol, target : GraphNode) : void {
    switch (tag) {
      case Item.TAGS: this._tags.delete(target as Tag); break;
      case Item.CONVERSIONS: this._conversions.delete(target as EffectConversion); break;
    }
  }
}


export class ItemDatabase {
  constructor(public name : string = "") {
  }


  private _effects = new Set<Effect>()

  get effects() : ReadonlySet<Effect> {
    return this._effects
  }

  effects_create(name? : string) : Effect {
    const instance = new Effect(name)
    this._effects.add(instance)
    return instance
  }

  effects_delete(instance : Effect) : void {
    if (this._effects.delete(instance)) {
      instance._clear_references()
    }
  }


  private _conversions = new Set<EffectConversion>()

  get conversions() : ReadonlySet<EffectConversion> {
    return this._conversions
  }

  conversions_create() : EffectConversion {
    const instance = new EffectConversion()
    this._conversions.add(instance)
    return instance
  }

  conversions_delete(instance : EffectConversion) : void {
    if (this._conversions.delete(instance)) {
      instance._clear_references()
    }
  }


  private _items = new Set<Item>()

  get items() : ReadonlySet<Item> {
    return this._items
  }

  items_create(name? : string, image? : File | undefined) : Item {
    const instance = new Item(name, image)
    this._items.add(instance)
    return instance
  }

  items_delete(instance : Item) : void {
    if (this._items.delete(instance)) {
      instance._clear_references()
    }
  }


  private _item_tags = new Set<Tag>()

  get item_tags() : ReadonlySet<Tag> {
    return this._item_tags
  }

  item_tags_create(name? : string) : Tag {
    const instance = new Tag(name)
    this._item_tags.add(instance)
    return instance
  }

  item_tags_delete(instance : Tag) : void {
    if (this._item_tags.delete(instance)) {
      instance._clear_references()
    }
  }


  private _conversion_tags = new Set<Tag>()

  get conversion_tags() : ReadonlySet<Tag> {
    return this._conversion_tags
  }

  conversion_tags_create(name? : string) : Tag {
    const instance = new Tag(name)
    this._conversion_tags.add(instance)
    return instance
  }

  conversion_tags_delete(instance : Tag) : void {
    if (this._conversion_tags.delete(instance)) {
      instance._clear_references()
    }
  }
}
