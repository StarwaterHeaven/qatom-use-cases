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

## Soluciones

- **MCP Apps interactivas** (un tablero o tarjeta en vivo dentro del chat): [guía](solutions/interactive-mcp-apps.md) y [ejemplo](examples/mcp-app-minimal).
- **Video** firmado y con vencimiento: [05](use-cases/05-video-streams.md).
- **Valores por defecto de la tienda** (feedback gratis, verificación gratis, `llms.txt` generado): [guía](solutions/storefront-defaults.md).
- **Después de la venta** (pagos, transferencias, distribuciones): [guía](solutions/after-the-sale.md).
- **Seguridad verificable** (modelo de amenazas público, cifrado de extremo a extremo con la clave en el fragmento del enlace, código del navegador fijado por hash): [10](use-cases/10-secrets-and-sensitive-handoffs.md) y [código](https://github.com/StarwaterHeaven/secure-secrets-exchange).

## Instala el skill

```bash
npx skills add StarwaterHeaven/qatom-use-cases --skill qatom-use-cases
```

Y dile a tu agente: *"Ayúdame a elegir un caso de uso de Qatom para mi proyecto."*
