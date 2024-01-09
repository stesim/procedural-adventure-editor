const graph_node =
`abstract class GraphNode {
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
}`


type NodeProperty = {
  name : string
  type : string
  initial_value : string
}


type NodeReferenceSingle = {
  kind : "reference"
  name : string
  type : string
}


type NodeReferenceSet = {
  kind : "reference_set"
  name : string
  type : string
}


type NodeReference =
    NodeReferenceSingle
  | NodeReferenceSet


type NodeDescriptor = {
  name : string
  properties : NodeProperty[]
  references : NodeReference[]
}


type GraphStoreDescriptor = {
  name : string
  node : NodeDescriptor
}


type GraphDescriptor = {
  name : string
  properties: NodeProperty[]
  stores : GraphStoreDescriptor[]
}


function generate_node_class(descriptor : NodeDescriptor) : string {
  const accessors = descriptor.references
    .map((member) => {
      const tag_field = `static ${member.name.toUpperCase()} = Symbol("${member.name}")`
      const tag = descriptor.name + "." + member.name.toUpperCase()
      if (member.kind === "reference") {
        const edge_field = `private _${member.name}? : ${member.type}`
        const edge = "this._" + member.name
        const getter = `get ${member.name}() { return ${edge} }`
        const setter =
`set ${member.name}(value) {
  if (${edge}) {
    ${edge}._remove_reference(${tag}, this)
  }
  ${edge} = value
  if (${edge}) {
    ${edge}._add_reference(${tag}, this)
  }
}`

        return [tag_field, edge_field, getter, setter].join("\n\n")
      } else if (member.kind === "reference_set") {
        const edges_field = `private _${member.name} = new Set<${member.type}>()`
        const edges = "this._" + member.name
        const getter = `get ${member.name}() : ReadonlySet<${member.type}> { return ${edges} }`
        const add =
`${member.name}_add(value : ${member.type}) : void {
  ${edges}.add(value)
  value._add_reference(${tag}, this)
}`
        const remove =
`${member.name}_remove(value : ${member.type}) : void {
  if (${edges}.delete(value)) {
    value._remove_reference(${tag}, this)
  }
}`

        return [tag_field, edges_field, getter, add, remove].join("\n\n")
      } else {
        throw new Error("unknown member type")
      }
    })

  const detach_reference_cases = descriptor.references
    .map((member) => {
      const tag = descriptor.name + "." + member.name.toUpperCase()
      switch (member.kind) {
        case "reference": return `case ${tag}: this._${member.name} = undefined; break;`
        case "reference_set": return `case ${tag}: this._${member.name}.delete(target as ${member.type}); break;`
      }
    })

  const detach_reference = detach_reference_cases.length === 0 ? undefined :
`protected _detach_reference(tag : symbol, target : GraphNode) : void {
  switch (tag) {
${indent(detach_reference_cases.join("\n"), 2)}
  }
}`

  const properties = descriptor.properties
    .map(p => `public ${p.name} : ${p.type} = ${p.initial_value}`)

  const constructor = properties.length > 0
    ? `constructor(${properties.join(", ")}) {\n${indent("super()")}\n}`
    : undefined

  const body = [...accessors, constructor, detach_reference].filter(v => v !== undefined).join("\n\n\n")

  const code = `export class ${descriptor.name} extends GraphNode {\n${indent(body)}\n}`
  return code
}


function generate_graph_class(descriptor : GraphDescriptor) : string {
  const properties = descriptor.properties.map(p => `public ${p.name} : ${p.type} = ${p.initial_value}`)
  const constructor = `constructor(${properties.join(", ")}) {\n}`

  const methods = descriptor.stores.map((store) => {
    const node = store.node
    const field = `private _${store.name} = new Set<${node.name}>()`

    const parameters = node.properties.map(p => `${p.name}? : ${p.type}`)
    const parameter_names = node.properties.map(p => p.name)
    const getter =
`get ${store.name}() : ReadonlySet<${node.name}> {
  return this._${store.name}
}`
    const create =
`${store.name}_create(${parameters.join(", ")}) : ${node.name} {
  const instance = new ${node.name}(${parameter_names.join(", ")})
  this._${store.name}.add(instance)
  return instance
}`
    const remove =
`${store.name}_delete(instance : ${node.name}) : void {
  if (this._${store.name}.delete(instance)) {
    instance._clear_references()
  }
}`

    return [field, getter, create, remove].join("\n\n")
  })

  const body = [constructor, ...methods].join("\n\n\n")

  return `export class ${descriptor.name} {\n${indent(body)}\n}`
}


function indent(string : string, levels = 1, indentation = "  ") : string {
  const total_indentation = indentation.repeat(levels)
  return total_indentation + string.replaceAll("\n", "\n" + total_indentation)
}


const nodes : NodeDescriptor[] = [
  {
    name: "Tag",
    properties: [
      { name: "name", type: "string", initial_value: '""' },
    ],
    references: [],
  },
  {
    name: "Effect",
    properties: [
      { name: "name", type: "string", initial_value: '""' },
    ],
    references: [],
  },
  {
    name: "EffectConversion",
    properties: [],
    references: [
      { kind: "reference_set", name: "tags", type: "Tag" },
      { kind: "reference_set", name: "inputs", type: "Effect" },
      { kind: "reference_set", name: "outputs", type: "Effect" },
    ]
  },
  {
    name: "Item",
    properties: [
      { name: "name", type: "string", initial_value: '""' },
      { name: "image", type: "File | undefined", initial_value: "undefined" },
    ],
    references: [
      { kind: "reference_set", name: "tags", type: "Tag" },
      { kind: "reference_set", name: "conversions", type: "EffectConversion" },
    ],
  },
]


const graph : GraphDescriptor = {
  name: "ItemDatabase",
  properties: [
    { name: "name", type: "string", initial_value: '""' }
  ],
  stores: [
    { name: "effects", node: nodes.find(d => d.name === "Effect")! },
    { name: "conversions", node: nodes.find(d => d.name === "EffectConversion")! },
    { name: "items", node: nodes.find(d => d.name === "Item")! },
    { name: "item_tags", node: nodes.find(d => d.name === "Tag")! },
    { name: "conversion_tags", node: nodes.find(d => d.name === "Tag")! },
  ],
}


console.log(graph_node)
console.log("\n")
console.log(nodes.map(generate_node_class).join("\n\n\n"))
console.log("\n")
console.log(generate_graph_class(graph))
