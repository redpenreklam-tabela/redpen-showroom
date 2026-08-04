# Redpen Showroom

Redpen Reklam için Next.js, React Three Fiber, Three.js, GSAP ve Lenis tabanlı etkileşimli 3D showroom başlangıç projesi.

## Çalıştırma

```powershell
cd D:\Projects\redpen-showroom
npm.cmd install
npm.cmd run dev
```

Ardından `http://localhost:3000` adresini açın.

## Üretim testi

```powershell
npm.cmd run build
```

## 3D model ekleme

GLB/GLTF dosyalarını `public/models` klasörüne koyun. İlk sahnedeki geçici tabela modeli `app/components/Scene.tsx` içindedir ve gerçek model geldiğinde `useGLTF` ile değiştirilebilir.
