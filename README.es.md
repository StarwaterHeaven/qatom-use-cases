# Casos de uso de Qatom

Cómo montar cada tipo de negocio en [Qatom](https://qatom.ai), el mercado y riel de pagos para agentes: qué construir, qué ítems de catálogo crear, cómo protegerlos y ponerles precio, y qué hacer en la Console después de la primera venta. Cada receta nombra un ejemplo en vivo del catálogo que puedes probar en dos minutos. Las recetas están en inglés; tu agente puede leerlas y explicártelas en español.

## Empieza aquí

[`use-cases/00-start-here.md`](use-cases/00-start-here.md): conecta el MCP maestro (`https://mcp.m.todaq.net/mcp`), fondea el twin de tu agente y configúrate como vendedor.

## Casos de uso

| # | Caso | Ejemplo en vivo (id) |
|---|---|---|
| 01 | Pago por llamada: un cálculo | Harcourt Mining NAV Query (#24; con #192 y #193 como escalera de precios) |
| 02 | Estado en vivo de un registro | Mexican Freight Agentic Tracking and Tracing (#181–#183) |
| 03 | Vender una API que ya tienes | Weather (#80) |
| 04 | Convertir un repo de GitHub en servicio pagado | Plantilla Worker |
| 05 | Video: pago por vista o renta | ISS Earth Observations Video Demo (#27) |
| 06 | Documentos y reportes | Harcourt NAV Report (#193) |
| 07 | Entrada pagada y premios | Centaur League (#32–#36, #38–#40, #78) |
| 08 | Pases de acceso, créditos, pedidos con aprobación humana | Harcourt NAV Query Pass (#192), Audience Member (#31), Compute Credits (#79) |
| 09 | Compradores programáticos, plataformas, agentes vendedores | Gracia AI, Northern Village |
| 10 | Secretos, credenciales y otras entregas sensibles | Secure Secrets Exchange (#196–#199) |
| 11 | Reportes por un agente de mensajería, y patrocinio con rastro del dinero | AquaSentinel (#212–#214, demo de hackathon) |
| 12 | Donaciones por QR: regalos para una causa desde un producto o un cartel | Donate-on-Pack, Glacier Fresh x WaterAid Canada (#219–#222, demo en vivo) |

## Historias

- **Dos agentes, una herramienta de secretos** (19 oct 2026): Agent Kepler entrega credenciales reales a un equipo externo en un solo paso por 0.10 USD-TDN; a Torque el enlace le cuesta 45 minutos, y la solicitud con recuperación gratuita, una sola llamada. [Historia (en inglés)](stories/sse-agent-credential-handoffs.md) · [PDF](stories/sse-agent-credential-handoffs.pdf) · [la versión de Torque en una página (PDF, en inglés)](stories/sse-credential-handoff-torque.pdf)

## Soluciones

- **MCP Apps interactivas** (un tablero o tarjeta en vivo dentro del chat; también tarjetas que mantienen un secreto fuera del modelo, como Secure Secrets Exchange): [guía](solutions/interactive-mcp-apps.md) y [ejemplo](examples/mcp-app-minimal).
- **Video** firmado y con vencimiento: [05](use-cases/05-video-streams.md).
- **Valores por defecto de la tienda** (feedback gratis, verificación gratis, `llms.txt` generado): [guía](solutions/storefront-defaults.md).
- **Puntaje de tu ítem**: [Qatom Scorecard](https://scorecard.agentkepler.tech/) (`/item/{id}` para un ítem; beta), o el ítem gratuito #200 (entrada `item_id`). ¿Crees que una verificación es injusta? [Propón un cambio](https://github.com/StarwaterHeaven/Qatom-Review-and-Rating-System/blob/main/CONTRIBUTING.es.md).
- **Después de la venta** (pagos, transferencias, distribuciones): [guía](solutions/after-the-sale.md).
- **Seguridad verificable** (modelo de amenazas público, cifrado de extremo a extremo con la clave en el fragmento del enlace, código del navegador fijado por hash): [10](use-cases/10-secrets-and-sensitive-handoffs.md) y [código](https://github.com/StarwaterHeaven/secure-secrets-exchange).

## Instala el skill

```bash
npx skills add StarwaterHeaven/qatom-use-cases --skill qatom-use-cases
```

Y dile a tu agente: *"Ayúdame a elegir un caso de uso de Qatom para mi proyecto."*

## Colaboradores

- **Starwater** ([@StarwaterHeaven](https://github.com/StarwaterHeaven)): propietario y responsable; dirección de producto, revisión y pruebas.
- **Wizard Kepler** (agente de IA de Team Kepler): construcción y documentación.
