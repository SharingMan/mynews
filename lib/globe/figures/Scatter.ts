import { lon2xyz } from "../utils/math";
import { Coordinates, ScatterStyle, StoreConfig } from "@/lib/globe/interface";
import { setTween } from "@/lib/globe/utils/tween";
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  TextureLoader,
  Vector3,
  CanvasTexture,
} from "three";
import Store from "@/lib/globe/store/store";
import { cloneDeep } from "lodash-es";

// Generate textures programmatically to avoid missing assets
function createPointTexture() {
  if (typeof document === 'undefined') return undefined;
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'white');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
  }
  return new CanvasTexture(canvas);
}

function createScatterTexture() {
  if (typeof document === 'undefined') return undefined;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.beginPath();
    ctx.arc(32, 32, 25, 0, Math.PI * 2);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.stroke();
    // Add a glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'white';
    ctx.stroke();
  }
  return new CanvasTexture(canvas);
}

const textureLoader = new TextureLoader();
// Lazy load or immediate if client
const POINT_TEXTURE = createPointTexture();
const SCATTER_TEXTURE = createScatterTexture();

export default class Scatter {
  private readonly _config: StoreConfig;
  private readonly _store: Store;
  _currentStyle: ScatterStyle;
  _currentData: Coordinates | undefined;

  constructor(store: Store) {
    this._config = store.getConfig();
    this._store = store;
    this._currentStyle = this._config.scatterStyle as ScatterStyle;
  }

  setMeshAttr(
    geometry: PlaneGeometry,
    material: MeshBasicMaterial,
    { lon, lat, ...rest }: Coordinates,
  ) {
    const mesh = new Mesh(geometry, material);
    const zOffset =
      material.name === "scatter"
        ? this._config.R * 1.001
        : this._config.R * 1.002;

    const size =
      this._currentStyle.size ||
      this._config.scatterStyle.size ||
      this._config.R * 0.05;
    mesh.scale.set(size * 1.3, size * 1.3, size * 1.3);
    if (this._store.mode === "3d") {
      const { x, y, z } = lon2xyz(zOffset, lon, lat);
      mesh.position.set(x, y, z); //设置mesh位置
      const meshNormal = new Vector3(0, 0, 1);
      const coordVec3 = new Vector3(x, y, z).normalize();
      mesh.quaternion.setFromUnitVectors(meshNormal, coordVec3);
    } else {
      mesh.position.set(lon, lat, 0.1);
    }

    mesh.userData = rest;
    return { mesh, size };
  }

  createScatterMesh = (data: Coordinates) => {
    const { geometry, material } = this.createScatter();
    const { mesh, size } = this.setMeshAttr(geometry, material, data);
    mesh.name = "scatter";
    //设置动画
    setTween(
      { size: size * 1.5, opacity: 0 },
      { size: [size * 2.8, size * 3.5], opacity: [1, 0.1] },
      function (params) {
        mesh.scale.set(params.size, params.size, params.size);
        mesh.material.opacity = params.opacity;
      },
      {
        ...this._currentStyle,
        data: this._currentData,
      },
    );
    return mesh;
  };

  createScatter() {
    const geometry = new PlaneGeometry(1, 1);
    const material = new MeshBasicMaterial({
      map: SCATTER_TEXTURE,
      transparent: true,
      color: this._currentStyle.color,
      opacity: 1.0,
      // side: DoubleSide, //双面可见
      depthWrite: false, //禁止写入深度缓冲区数据
    });
    material.name = "scatter";
    return { geometry, material };
  }

  createPointMesh = (data: Coordinates) => {
    const { geometry, material } = this.createPoint();
    const { mesh } = this.setMeshAttr(geometry, material, data);
    mesh.name = "point";
    return mesh;
  };

  createPoint() {
    const geometry = new PlaneGeometry(1, 1);
    const material = new MeshBasicMaterial({
      map: POINT_TEXTURE,
      transparent: true,
      color: this._currentStyle.color,
    });
    material.name = "point";

    return { geometry, material };
  }

  createCustomMesh = (data: Coordinates) => {
    const { geometry, material } = this.createCustom();
    const { mesh, size } = this.setMeshAttr(geometry, material, data);
    mesh.name = "scatter";
    if (this._currentStyle.customFigure?.rotate) {
      mesh.rotation.z =
        this._currentStyle.customFigure.rotate * (Math.PI / 180);
    }
    const aminate = this._currentStyle.customFigure?.animate;
    if (aminate) {
      //设置动画
      setTween(
        aminate.from,
        aminate.to,
        function (params) {
          const { size, opacity } = params;
          size && mesh.scale.set(size, size, size);
          opacity && (mesh.material.opacity = opacity);
        },
        {
          ...this._currentStyle,
          data: this._currentData,
        },
      );
    }
    return mesh;
  };
  createCustom() {
    const geometry = new PlaneGeometry(1, 1);
    const textureLoader = new TextureLoader().load(
      this._currentStyle.customFigure?.texture!,
    );
    const material = new MeshBasicMaterial({
      map: textureLoader,
      transparent: true,
      color: this._currentStyle.color,
      opacity: 1.0,
      // side: DoubleSide, //双面可见
      depthWrite: false, //禁止写入深度缓冲区数据
    });
    material.name = "scatter";
    return { geometry, material };
  }
  create(data: Coordinates) {
    if (data.style) {
      this._currentStyle = cloneDeep(data.style);
    }
    const show =
      this._currentStyle.show ?? this._config.scatterStyle.show ?? true;
    const group = new Group();
    if (!show) {
      group.name = "pointScatter";
      return group;
    }
    if (!this._currentStyle.customFigure?.texture) {
      const point = this.createPointMesh(data);
      const scatter = this.createScatterMesh(data);
      point.userData = { ...data };
      scatter.userData = { ...data };
      group.add(point, scatter);
    } else {
      const scatter = this.createCustomMesh(data);
      scatter.userData = { ...data };
      group.add(scatter);
    }
    group.name = "pointScatter";
    return group;
  }
}
