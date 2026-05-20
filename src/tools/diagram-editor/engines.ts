// ─── template types ───────────────────────────────────────────────────────────

export type MermaidTemplate = 'sequence' | 'flowchart' | 'class' | 'state' | 'er'

export const MERMAID_TEMPLATE_META: { id: MermaidTemplate; label: string; icon: string }[] = [
  { id: 'sequence',  label: 'Sequence',  icon: '↕' },
  { id: 'flowchart', label: 'Flowchart', icon: '⬡' },
  { id: 'class',     label: 'Class',     icon: '▣' },
  { id: 'state',     label: 'State',     icon: '◉' },
  { id: 'er',        label: 'ER',        icon: '⊞' },
]

export const MERMAID_TEMPLATES: Record<MermaidTemplate, string> = {
  sequence: `sequenceDiagram
    autonumber
    participant C as Client
    participant GW as API Gateway
    participant Auth
    participant Svc as Service
    participant DB

    C->>GW: POST /orders {item, qty}
    GW->>Auth: validateToken(jwt)
    Auth-->>GW: {userId: 42, role: buyer}
    GW->>Svc: createOrder(userId, item, qty)
    Svc->>DB: INSERT INTO orders
    DB-->>Svc: orderId = 1337
    Svc-->>GW: {orderId: 1337, status: pending}
    GW-->>C: 201 Created`,

  flowchart: `flowchart TD
    A([Request]) --> B{Authenticated?}
    B -- No --> C[401 Unauthorized]
    B -- Yes --> D{Rate limited?}
    D -- Yes --> E[429 Too Many Requests]
    D -- No --> F[Validate payload]
    F --> G{Valid?}
    G -- No --> H[400 Bad Request]
    G -- Yes --> I[Process request]
    I --> J[(Database)]
    J --> K{Success?}
    K -- No --> L[500 Internal Error]
    K -- Yes --> M[200 OK]`,

  class: `classDiagram
    class Order {
        +UUID id
        +UUID userId
        +OrderStatus status
        +Decimal total
        +DateTime createdAt
        +cancel() void
        +fulfill() void
    }
    class OrderItem {
        +UUID orderId
        +UUID productId
        +int quantity
        +Decimal unitPrice
    }
    class Product {
        +UUID id
        +String name
        +Decimal price
        +int stock
        +reserve(qty) bool
    }
    class User {
        +UUID id
        +String email
        +placeOrder(items) Order
    }

    User "1" --> "0..*" Order : places
    Order "1" *-- "1..*" OrderItem : contains
    OrderItem "*" --> "1" Product : references`,

  state: `stateDiagram-v2
    [*] --> Pending : order placed

    Pending --> Confirmed : payment OK
    Pending --> Cancelled : payment failed
    Pending --> Cancelled : user cancelled

    Confirmed --> Processing : warehouse picks
    Confirmed --> Cancelled : out of stock

    Processing --> Shipped : dispatched
    Shipped --> Delivered : confirmed
    Shipped --> Returned : undeliverable

    Delivered --> Returned : return request
    Returned --> Refunded : approved

    Cancelled --> [*]
    Refunded --> [*]
    Delivered --> [*]`,

  er: `erDiagram
    USER {
        uuid id PK
        varchar email UK
        varchar full_name
        timestamp created_at
    }
    ORDER {
        uuid id PK
        uuid user_id FK
        varchar status
        decimal total
        timestamp created_at
    }
    ORDER_ITEM {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        int quantity
        decimal unit_price
    }
    PRODUCT {
        uuid id PK
        varchar name
        decimal price
        int stock
    }

    USER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : referenced`,
}

export const PLANTUML_TEMPLATE = `@startuml
!theme plain

title Microservices – Component Diagram

package "Edge" {
  [Load Balancer] as lb
  [API Gateway] as gw
}

package "Services" {
  [User Service] as user
  [Order Service] as order
  [Inventory Service] as inv
  [Notification Service] as notif
}

package "Data" {
  database "Users DB" as udb
  database "Orders DB" as odb
  database "Inventory DB" as idb
}

queue "Message Broker" as mq

lb --> gw
gw --> user
gw --> order
gw --> inv

user --> udb
order --> odb
inv --> idb

order --> mq : OrderCreated
mq --> notif : consume
mq --> inv : consume

@enduml`

// ─── Mermaid ──────────────────────────────────────────────────────────────────

let mermaidInited = false
let renderSeq = 0

export async function renderMermaid(code: string): Promise<string> {
  if (!code.trim()) return ''

  const mermaid = (await import('mermaid')).default

  if (!mermaidInited) {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#0d1117',
        primaryColor: '#1f6feb',
        primaryTextColor: '#c9d1d9',
        lineColor: '#58a6ff',
        secondaryColor: '#161b22',
        tertiaryColor: '#21262d',
      },
    })
    mermaidInited = true
  }

  const id = `mm-${++renderSeq}`
  try {
    const { svg } = await mermaid.render(id, code)
    // Make the SVG responsive inside its container
    return svg.replace(/max-width:\s*[\d.]+px/, 'max-width: 100%')
  } finally {
    document.getElementById(id)?.remove()
  }
}

// ─── PlantUML ─────────────────────────────────────────────────────────────────

// PlantUML encoding: UTF-8 → deflate-raw → custom base64 alphabet
const PUML_TABLE = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'

export async function encodePlantUML(text: string): Promise<string> {
  if (!text.trim()) return ''

  const data = new TextEncoder().encode(text)
  const cs = new CompressionStream('deflate')
  const writer = cs.writable.getWriter()
  await writer.write(data)
  await writer.close()
  const buf = await new Response(cs.readable).arrayBuffer()
  const bytes = new Uint8Array(buf)

  let result = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0
    result += PUML_TABLE[(b0 >> 2) & 0x3f]
    result += PUML_TABLE[((b0 & 0x3) << 4) | ((b1 >> 4) & 0xf)]
    result += PUML_TABLE[((b1 & 0xf) << 2) | ((b2 >> 6) & 0x3)]
    result += PUML_TABLE[b2 & 0x3f]
  }
  return result
}

export function plantUmlSvgUrl(encoded: string): string {
  return `https://www.plantuml.com/plantuml/svg/~1${encoded}`
}
