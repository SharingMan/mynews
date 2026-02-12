import { Sprite, SpriteMaterial, TextureLoader, CanvasTexture } from "three";
import { StoreConfig } from "@/lib/globe/interface";

function createSpriteTexture() {
  if (typeof document === 'undefined') return undefined;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(121, 126, 255, 1)'); // Use similar color to default
    grad.addColorStop(1, 'rgba(121, 126, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  return new CanvasTexture(canvas);
}

export default (config: StoreConfig) => {
  // TextureLoader创建一个纹理加载器对象，可以加载图片作为纹理贴图
  const textureLoader = new TextureLoader();
  const texture = createSpriteTexture();
  // 创建精灵材质对象SpriteMaterial
  const spriteMaterial = new SpriteMaterial({
    color: config.spriteStyle.color,
    map: texture, //设置精灵纹理贴图
    transparent: true, //开启透明
    opacity: 1, //可以通过透明度整体调节光圈
    depthWrite: false,
  });
  // 创建表示地球光圈的精灵模型
  const sprite = new Sprite(spriteMaterial);
  const cardinalNumber = config.spriteStyle.size || 3;
  sprite.scale.set(config.R! * cardinalNumber, config.R! * cardinalNumber, 1); //适当缩放精灵
  // sprite.scale.set(R*4.0, R*4.0, 1);//光圈相比较地球偏大
  return sprite;
};
