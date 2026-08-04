"use client";

import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

type SceneProps = {
  modelPath: string;
};

function isBackdropName(name: string) {
  return /(background|backdrop|studio|cyclorama|infinite|world|environment|room|wall|plane|floor)/i.test(
    name,
  );
}

function RealModel({ modelPath }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);

  const preparedModel = useMemo(() => {
    const clone = SkeletonUtils.clone(scene) as THREE.Group;

    // GLB içindeki kameraları kaldırıyoruz fakat Blender'dan gelen ışıkları
    // özellikle koruyoruz. Önceki sürüm bütün THREE.Light nesnelerini sildiği
    // için Blender'da eklediğin Point/Spot ışıkları siteye hiç ulaşmıyordu.
    const removableCameras: THREE.Object3D[] = [];
    clone.traverse((object) => {
      if (object instanceof THREE.Camera) {
        removableCameras.push(object);
        return;
      }

      if (object instanceof THREE.PointLight) {
        object.castShadow = false;
        object.decay = 2;
        object.distance = object.distance > 0 ? object.distance : 8;
        object.intensity = THREE.MathUtils.clamp(
          object.intensity * 0.08,
          0.15,
          4.0,
        );
      } else if (object instanceof THREE.SpotLight) {
        object.castShadow = false;
        object.decay = 2;
        object.distance = object.distance > 0 ? object.distance : 10;
        object.penumbra = Math.max(object.penumbra, 0.55);
        object.intensity = THREE.MathUtils.clamp(
          object.intensity * 0.08,
          0.2,
          5.0,
        );
      } else if (object instanceof THREE.DirectionalLight) {
        object.castShadow = false;
        object.intensity = THREE.MathUtils.clamp(object.intensity * 0.2, 0.08, 1.2);
      }
    });
    removableCameras.forEach((object) => object.parent?.remove(object));

    const initialBox = new THREE.Box3().setFromObject(clone);
    const initialSize = initialBox.getSize(new THREE.Vector3());
    const backdropCandidates: THREE.Object3D[] = [];

    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = true;

      // Her mesh için materyali klonluyoruz. Böylece bir modelde yaptığımız
      // emissive ayarı diğer slaytlara veya GLTF önbelleğine bulaşmıyor.
      const sourceMaterials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      const preparedMaterials = sourceMaterials.map((sourceMaterial) => {
        const material = sourceMaterial.clone();

        if (
          material instanceof THREE.MeshStandardMaterial ||
          material instanceof THREE.MeshPhysicalMaterial
        ) {
          const materialName = material.name.toLocaleLowerCase("tr-TR");
          const nameSuggestsEmission =
            /(emission|emissive|emit|light|led|neon|glow|isik|ışık|lamba|lamp|bulb)/i.test(
              materialName,
            );

          const emissiveStrength = Math.max(
            material.emissive.r,
            material.emissive.g,
            material.emissive.b,
          );
          const hasExportedEmission =
            emissiveStrength > 0.015 || Boolean(material.emissiveMap);
          const shouldGlow = hasExportedEmission || nameSuggestsEmission;

          if (shouldGlow) {
            // İsim ışıklı olduğunu söylüyor fakat Blender emissive rengini siyah
            // aktardıysa, ana materyal rengini emissive başlangıcı olarak kullan.
            if (emissiveStrength <= 0.015) {
              material.emissive.copy(material.color).multiplyScalar(1.2);
            }

            // Blender'daki Emission Strength glTF'ye birebir taşınmadığı için
            // web tarafında kontrollü biçimde kuvvetlendiriyoruz.
            material.emissiveIntensity = Math.max(
              material.emissiveIntensity || 1,
              1.18,
            );
            material.toneMapped = false;
          } else {
            material.toneMapped = true;
          }

          material.needsUpdate = true;
        }

        return material;
      });

      object.material = Array.isArray(object.material)
        ? preparedMaterials
        : preparedMaterials[0];

      object.geometry.computeBoundingBox();
      const localSize = object.geometry.boundingBox?.getSize(new THREE.Vector3());

      if (localSize && isBackdropName(object.name)) {
        const wideX = localSize.x >= initialSize.x * 0.82;
        const wideY = localSize.y >= initialSize.y * 0.82;
        const wideZ = localSize.z >= initialSize.z * 0.82;
        const thinX = localSize.x <= Math.max(initialSize.x * 0.08, 0.02);
        const thinY = localSize.y <= Math.max(initialSize.y * 0.08, 0.02);
        const thinZ = localSize.z <= Math.max(initialSize.z * 0.08, 0.02);

        if (
          (wideX && wideY && thinZ) ||
          (wideX && wideZ && thinY) ||
          (wideY && wideZ && thinX)
        ) {
          backdropCandidates.push(object);
        }
      }
    });

    backdropCandidates.forEach((object) => object.parent?.remove(object));

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);

    const largestAxis = Math.max(size.x, size.y, size.z);
    const fitScale = largestAxis > 0 ? 3.75 / largestAxis : 1;
    clone.scale.setScalar(fitScale);

    const normalizedBox = new THREE.Box3().setFromObject(clone);
    const normalizedCenter = normalizedBox.getCenter(new THREE.Vector3());
    clone.position.sub(normalizedCenter);

    return clone;
  }, [scene]);

  useFrame((state, delta) => {
    if (!group.current) return;

    const targetY = -0.08 + state.pointer.x * 0.1;
    const targetX = 0.015 - state.pointer.y * 0.05;

    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      targetY,
      3.2,
      delta,
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      targetX,
      3.2,
      delta,
    );
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      Math.sin(state.clock.elapsedTime * 0.65) * 0.035,
      2,
      delta,
    );
  });

  return (
    <group ref={group} rotation={[0.015, -0.08, 0]}>
      <primitive object={preparedModel} />
    </group>
  );
}

function SceneFallback() {
  return <div className="scene-fallback">3D MODEL YÜKLENİYOR</div>;
}

export default function Scene({ modelPath }: SceneProps) {
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const keepWheelInsideViewer = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    shell.addEventListener("wheel", keepWheelInsideViewer, { passive: false });
    return () => shell.removeEventListener("wheel", keepWheelInsideViewer);
  }, []);

  return (
    <div
      ref={shellRef}
      className="scene-shell"
      aria-label="Etkileşimli üç boyutlu Redpen modeli"
      data-lenis-prevent
      data-lenis-prevent-wheel
    >
      <Canvas
        shadows
        frameloop="always"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.12, 7.35], fov: 38 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.72,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        onCreated={({ gl }) => gl.setClearColor("#050507", 1)}
      >
        <color attach="background" args={["#050507"]} />

        <ambientLight intensity={0.58} color="#ffffff" />
        <hemisphereLight args={["#ffffff", "#151118", 0.62]} />
        <directionalLight
          position={[4.8, 5.6, 6.2]}
          intensity={1.15}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight
          position={[-4.5, 1.8, 3.8]}
          intensity={0.5}
          color="#fff1f3"
        />
        <pointLight
          position={[0, -1.2, 4.5]}
          intensity={0.32}
          distance={12}
          color="#ffffff"
        />
        <spotLight
          position={[0, 2.8, 5.2]}
          intensity={1.05}
          distance={18}
          angle={0.72}
          penumbra={0.92}
          color="#ffffff"
          castShadow
        />
        <pointLight
          position={[0, 0.25, 2.5]}
          intensity={0.28}
          distance={8}
          decay={2}
          color="#ffffff"
        />

        <Suspense fallback={null}>
          <Environment
            files="/hdri/studio.hdr"
            background={false}
            environmentIntensity={0.14}
          />
          <RealModel key={modelPath} modelPath={modelPath} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={4.6}
          maxDistance={11}
          minPolarAngle={Math.PI / 2.45}
          maxPolarAngle={Math.PI / 1.68}
          rotateSpeed={0.42}
          zoomSpeed={0.65}
        />

        <EffectComposer multisampling={0}>
          <Bloom
            mipmapBlur
            intensity={0.08}
            luminanceThreshold={1.35}
            luminanceSmoothing={0.04}
            radius={0.16}
          />
        </EffectComposer>
      </Canvas>

      <div className="scene-vignette" />
      <div className="drag-hint"><span /> SÜRÜKLE · DÖNDÜR · YAKINLAŞTIR</div>
    </div>
  );
}
