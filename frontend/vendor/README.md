# vendor/

## `laya-ts-0.1.0.tgz`

[`laya-ts`](https://github.com/NandhaKishorM/laya/tree/main/laya-ts) es el runtime de Laya para JavaScript (corre el modelo con ONNX Runtime Web en el navegador). **No está publicado en npm**, así que se instala desde este `.tgz` (`"laya-ts": "file:vendor/laya-ts-0.1.0.tgz"` en `package.json`).

Es una copia de `laya-ts` (Apache-2.0) construida desde el commit `4ac226d5ee88ed6df8db288a05c766d7a34ee682` de `NandhaKishorM/laya`, con dos cambios:

1. **Caché primero para el modelo** (`laya-ts.patch`). En el original, `fetchArrayBuffer` siempre va primero a la red y usa CacheStorage solo si no hay conexión, así que cada visita volvería a descargar ~1.3 GB (más 34 MB del tokenizer). El parche sirve `.onnx`, `.onnx.data` y `.json` desde la caché cuando ya están. Por eso `VITE_LAYA_MODEL_URL` debe apuntar a un commit fijo de Hugging Face y no a `main`: si el modelo cambiara, el navegador seguiría usando la copia guardada.
2. **Sin `optionalDependencies`**. Se quitó la línea `"optionalDependencies": { "onnxruntime-node": ..., "onnxruntime-web": ... }` de su `package.json`: `onnxruntime-node` es un binario nativo solo para Node y aquí no se usa. En el navegador, `onnxruntime-web` se resuelve con el import map de `index.html`.

### Regenerarlo

```bash
git clone https://github.com/NandhaKishorM/laya
cd laya && git checkout 4ac226d5ee88ed6df8db288a05c766d7a34ee682
git apply /ruta/a/prisma/frontend/vendor/laya-ts.patch   # desde la raíz del repo de Laya
cd laya-ts
# editar package.json: borrar la línea "optionalDependencies"
npm ci && npm run build
npm pack                                                  # genera laya-ts-0.1.0.tgz
```

Si algún día `laya-ts` se publica en npm con caché primero, se puede reemplazar todo esto por `pnpm add laya-ts` y borrar esta carpeta.
