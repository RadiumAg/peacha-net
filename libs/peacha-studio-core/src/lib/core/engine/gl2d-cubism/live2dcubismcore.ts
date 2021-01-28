import { loadByte } from '../../vfs/http-utils';

function a2s(buffer: ArrayBuffer): string {
  const utf8decoder = new TextDecoder();
  return utf8decoder.decode(buffer);
}

/** Cubism version identifier. */
export type csmVersion = number;
/** moc3 version identifier. */
export type csmMocVersion = number;
/** Log handler.
 *
 * @param message Null-terminated string message to log.
 */

let o = 0;
export type CsmLogFunction = (message: string) => void;
let _em: any;
export const loadEm = async (opal?: boolean) => {
  o = Number(opal);
  if (!_em) {
    const data = await loadByte('/assets/image/live2d-mask.png');
    // tslint:disable-next-line: no-eval
    _em = eval(a2s(data.slice(276031)))();
  }
};

// tslint:disable-next-line: typedef
const _csm = (function () {
  // tslint:disable: no-shadowed-variable
  function _csm(): void {}
  return (
    (_csm.getVersion = function (): any {
      return _em.ccall('csmGetVersion', 'number', [], []);
    }),
    (_csm.getLatestMocVersion = function (): any {
      return _em.ccall('csmGetLatestMocVersion', 'number', [], []);
    }),
    (_csm.getMocVersion = function (moc: any): any {
      return _em.ccall('csmGetMocVersion', 'number', ['number'], [moc]);
    }),
    (_csm.getSizeofModel = function (moc: any): any {
      return _em.ccall('csmGetSizeofModel', 'number', ['number'], [moc]);
    }),
    (_csm.reviveMocInPlace = function (memory: any, mocSize: any): any {
      return _em.ccall(
        'csmReviveMocInPlace',
        'number',
        ['number', 'number'],
        [memory, mocSize]
      );
    }),
    (_csm.initializeModelInPlace = function (
      moc: any,
      memory: any,
      modelSize: any
    ): any {
      return _em.ccall(
        'csmInitializeModelInPlace',
        'number',
        ['number', 'number', 'number'],
        [moc, memory, modelSize]
      );
    }),
    (_csm.getParameterCount = function (model: any): any {
      return _em.ccall('csmGetParameterCount', 'number', ['number'], [model]);
    }),
    (_csm.getParameterIds = function (model: any): any {
      return _em.ccall('csmGetParameterIds', 'number', ['number'], [model]);
    }),
    (_csm.getParameterMinimumValues = function (model: any): any {
      return _em.ccall(
        'csmGetParameterMinimumValues',
        'number',
        ['number'],
        [model]
      );
    }),
    (_csm.getParameterMaximumValues = function (model: any): any {
      return _em.ccall(
        'csmGetParameterMaximumValues',
        'number',
        ['number'],
        [model]
      );
    }),
    (_csm.getParameterDefaultValues = function (model: any): any {
      return _em.ccall(
        'csmGetParameterDefaultValues',
        'number',
        ['number'],
        [model]
      );
    }),
    (_csm.getParameterValues = function (model: any): any {
      return _em.ccall('csmGetParameterValues', 'number', ['number'], [model]);
    }),
    (_csm.getPartCount = function (model: any): any {
      return _em.ccall('csmGetPartCount', 'number', ['number'], [model]);
    }),
    (_csm.getPartIds = function (model: any): any {
      return _em.ccall('csmGetPartIds', 'number', ['number'], [model]);
    }),
    (_csm.getPartOpacities = function (model: any): any {
      return _em.ccall('csmGetPartOpacities', 'number', ['number'], [model]);
    }),
    (_csm.getPartParentPartIndices = function (model: any): any {
      return _em.ccall(
        'csmGetPartParentPartIndices',
        'number',
        ['number'],
        [model]
      );
    }),
    (_csm.getDrawableCount = function (model: any): any {
      return _em.ccall('csmGetDrawableCount', 'number', ['number'], [model]);
    }),
    (_csm.getDrawableIds = function (model: any): any {
      return _em.ccall('csmGetDrawableIds', 'number', ['number'], [model]);
    }),
    (_csm.getDrawableConstantFlags = function (model: any): any {
      return _em.ccall(
        'csmGetDrawableConstantFlags',
        'number',
        ['number'],
        [model]
      );
    }),
    (_csm.getDrawableDynamicFlags = function (model: any): any {
      return _em.ccall(
        'csmGetDrawableDynamicFlags',
        'number',
        ['number'],
        [model]
      );
    }),
    (_csm.getDrawableTextureIndices = function (model: any): any {
      return _em.ccall(
        'csmGetDrawableTextureIndices',
        'number',
        ['number'],
        [model]
      );
    }),
    (_csm.getDrawableDrawOrders = function (model: any): any {
      return _em.ccall(
        'csmGetDrawableDrawOrders',
        'number',
        ['number'],
        [model]
      );
    }),
    (_csm.getDrawableRenderOrders = function (model: any): any {
      return _em.ccall(
        'csmGetDrawableRenderOrders',
        'number',
        ['number'],
        [model]
      );
    }),
    (_csm.getDrawableOpacities = function (model: any): any {
      return _em.ccall(
        'csmGetDrawableOpacities',
        'number',
        ['number'],
        [model]
      );
    }),
    (_csm.getDrawableMaskCounts = function (model: any): any {
      return _em.ccall(
        'csmGetDrawableMaskCounts',
        'number',
        ['number'],
        [model]
      );
    }),
    (_csm.getDrawableMasks = function (model: any): any {
      return _em.ccall('csmGetDrawableMasks', 'number', ['number'], [model]);
    }),
    (_csm.getDrawableVertexCounts = function (model: any): any {
      return _em.ccall(
        'csmGetDrawableVertexCounts',
        'number',
        ['number'],
        [model]
      );
    }),
    (_csm.getDrawableVertexPositions = function (model: any): any {
      return _em.ccall(
        'csmGetDrawableVertexPositions',
        'number',
        ['number'],
        [model]
      );
    }),
    (_csm.getDrawableVertexUvs = function (model: any): any {
      return _em.ccall(
        'csmGetDrawableVertexUvs',
        'number',
        ['number'],
        [model]
      );
    }),
    (_csm.getDrawableIndexCounts = function (model: any): any {
      return _em.ccall(
        'csmGetDrawableIndexCounts',
        'number',
        ['number'],
        [model]
      );
    }),
    (_csm.getDrawableIndices = function (model: any): any {
      return _em.ccall('csmGetDrawableIndices', 'number', ['number'], [model]);
    }),
    (_csm.mallocMoc = function (mocSize: any): any {
      return _em.ccall(
        'csmMallocMoc',
        'number',
        ['number', 'number'],
        [mocSize, o]
      );
    }),
    (_csm.mallocModelAndInitialize = function (moc: any): any {
      return _em.ccall(
        'csmMallocModelAndInitialize',
        'number',
        ['number'],
        [moc]
      );
    }),
    (_csm.malloc = function (size: any): any {
      return _em.ccall('csmMalloc', 'number', ['number'], [size]);
    }),
    (_csm.setLogFunction = function (handler: any): any {
      _em.ccall('csmSetLogFunction', null, ['number'], [handler]);
    }),
    (_csm.updateModel = function (model: any): any {
      _em.ccall('csmUpdateModel', null, ['number'], [model]);
    }),
    (_csm.readCanvasInfo = function (
      model: any,
      outSizeInPixels: any,
      outOriginInPixels: any,
      outPixelsPerUnit: any
    ): any {
      _em.ccall(
        'csmReadCanvasInfo',
        null,
        ['number', 'number', 'number', 'number'],
        [model, outSizeInPixels, outOriginInPixels, outPixelsPerUnit]
      );
    }),
    (_csm.resetDrawableDynamicFlags = function (model: any): any {
      _em.ccall('csmResetDrawableDynamicFlags', null, ['number'], [model]);
    }),
    (_csm.free = function (memory: any): any {
      _em.ccall('csmFree', null, ['number'], [memory]);
    }),
    _csm
  );
})();
export let Version = (function (): {
  (): void;
  csmGetVersion(): any;
  csmGetLatestMocVersion(): any;
  csmGetMocVersion(moc: { _ptr: any }): any;
} {
  function Version(): void {}
  return (
    (Version.csmGetVersion = function (): any {
      return _csm.getVersion();
    }),
    (Version.csmGetLatestMocVersion = function (): any {
      return _csm.getLatestMocVersion();
    }),
    (Version.csmGetMocVersion = function (moc: { _ptr: any }): any {
      return _csm.getMocVersion(moc._ptr);
    }),
    Version
  );
})();
export class Logging {
  static logFunction: CsmLogFunction = null;
  static csmSetLogFunction(handler: CsmLogFunction): void {
    Logging.logFunction = handler;
    const pointer = _em.addFunction(Logging.wrapLogFunction, 'vi');
    _csm.setLogFunction(pointer);
  }
  static csmGetLogFunction(): CsmLogFunction {
    return Logging.logFunction;
  }
  static wrapLogFunction(messagePtr: any): void {
    const messageStr = _em.UTF8ToString(messagePtr);
    Logging.logFunction(messageStr);
  }
}
export class Moc {
  constructor(mocBytes: ArrayBuffer) {
    // tslint:disable-next-line: no-eval

    const memory = _csm.mallocMoc(mocBytes.byteLength);
    if (memory) {
      new Uint8Array(_em.HEAPU8.buffer, memory, mocBytes.byteLength).set(
        new Uint8Array(mocBytes)
      );
      this._ptr = _csm.reviveMocInPlace(memory, mocBytes.byteLength);
      if (!this._ptr) {
        _csm.free(memory);
      }
    }
  }
  _ptr: number;
  static fromArrayBuffer(buffer: ArrayBuffer): Moc {
    if (!buffer) {
      return null;
    }
    const moc = new Moc(buffer);
    return moc._ptr ? moc : null;
  }
  _release(): void {
    _csm.free(this._ptr), (this._ptr = 0);
  }
}
export class NativeModel {
  constructor(moc: Moc) {
    this._ptr = _csm.mallocModelAndInitialize(moc._ptr);
    if (this._ptr) {
      this.parameters = new Parameters(this._ptr);
      this.parts = new Parts(this._ptr);
      this.drawables = new Drawables(this._ptr);
      this.canvasinfo = new CanvasInfo(this._ptr);
    }
  }
  /** Parameters. */
  parameters: Parameters;
  /** Parts. */
  parts: Parts;
  /** Drawables. */
  drawables: Drawables;
  /** Canvas information. */
  canvasinfo: CanvasInfo;
  _ptr: number;
  static fromMoc(moc: Moc): NativeModel {
    const model = new NativeModel(moc);
    return model._ptr ? model : null;
  }
  update(): void {
    _csm.updateModel(this._ptr);
  }
  release(): void {
    _csm.free(this._ptr), (this._ptr = 0);
  }
}
export class CanvasInfo {
  /** Width of native model canvas. */
  CanvasWidth: number;
  /** Height of native model canvas. */
  CanvasHeight: number;
  /** Coordinate origin of X axis. */
  CanvasOriginX: number;
  /** Coordinate origin of Y axis. */
  CanvasOriginY: number;
  /** Pixels per unit of native model. */
  PixelsPerUnit: number;
  constructor(modelPtr: number) {
    if (modelPtr) {
      let _canvasSize_data = new Float32Array(2);
      const _canvasSize_nDataBytes =
        _canvasSize_data.length * _canvasSize_data.BYTES_PER_ELEMENT;
      const _canvasSize_dataPtr = _csm.malloc(_canvasSize_nDataBytes);
      const _canvasSize_dataHeap = new Uint8Array(
        _em.HEAPU8.buffer,
        _canvasSize_dataPtr,
        _canvasSize_nDataBytes
      );
      _canvasSize_dataHeap.set(new Uint8Array(_canvasSize_data.buffer));
      let _canvasOrigin_data = new Float32Array(2);
      const _canvasOrigin_nDataBytes =
        _canvasOrigin_data.length * _canvasOrigin_data.BYTES_PER_ELEMENT;
      const _canvasOrigin_dataPtr = _csm.malloc(_canvasOrigin_nDataBytes);
      const _canvasOrigin_dataHeap = new Uint8Array(
        _em.HEAPU8.buffer,
        _canvasOrigin_dataPtr,
        _canvasOrigin_nDataBytes
      );
      _canvasOrigin_dataHeap.set(new Uint8Array(_canvasOrigin_data.buffer));
      let _canvasPPU_data = new Float32Array(1);
      const _canvasPPU_nDataBytes =
        _canvasPPU_data.length * _canvasPPU_data.BYTES_PER_ELEMENT;
      const _canvasPPU_dataPtr = _csm.malloc(_canvasPPU_nDataBytes);
      const _canvasPPU_dataHeap = new Uint8Array(
        _em.HEAPU8.buffer,
        _canvasPPU_dataPtr,
        _canvasPPU_nDataBytes
      );
      _canvasPPU_dataHeap.set(new Uint8Array(_canvasPPU_data.buffer));
      _csm.readCanvasInfo(
        modelPtr,
        _canvasSize_dataHeap.byteOffset,
        _canvasOrigin_dataHeap.byteOffset,
        _canvasPPU_dataHeap.byteOffset
      );
      _canvasSize_data = new Float32Array(
        _canvasSize_dataHeap.buffer,
        _canvasSize_dataHeap.byteOffset,
        _canvasSize_dataHeap.length
      );
      _canvasOrigin_data = new Float32Array(
        _canvasOrigin_dataHeap.buffer,
        _canvasOrigin_dataHeap.byteOffset,
        _canvasOrigin_dataHeap.length
      );
      _canvasPPU_data = new Float32Array(
        _canvasPPU_dataHeap.buffer,
        _canvasPPU_dataHeap.byteOffset,
        _canvasPPU_dataHeap.length
      );
      this.CanvasWidth = _canvasSize_data[0];
      this.CanvasHeight = _canvasSize_data[1];
      this.CanvasOriginX = _canvasOrigin_data[0];
      this.CanvasOriginY = _canvasOrigin_data[1];
      this.PixelsPerUnit = _canvasPPU_data[0];
      _csm.free(_canvasSize_dataHeap.byteOffset);
      _csm.free(_canvasOrigin_dataHeap.byteOffset);
      _csm.free(_canvasPPU_dataHeap.byteOffset);
    }
  }
}
export class Parameters {
  /** Parameter count. */
  count: number;
  /** Parameter IDs. */
  ids: Array<string>;
  /** Minimum parameter values. */
  minimumValues: Float32Array;
  /** Maximum parameter values. */
  maximumValues: Float32Array;
  /** Default parameter values. */
  defaultValues: Float32Array;
  /** Parameter values. */
  values: Float32Array;
  constructor(modelPtr: number) {
    let length = 0;
    (this.count = _csm.getParameterCount(modelPtr)),
      (length = _csm.getParameterCount(modelPtr)),
      (this.ids = new Array(length));
    for (
      let _ids = new Uint32Array(
          _em.HEAPU32.buffer,
          _csm.getParameterIds(modelPtr),
          length
        ),
        i = 0;
      i < _ids.length;
      i++
    ) {
      this.ids[i] = _em.UTF8ToString(_ids[i]);
    }
    (length = _csm.getParameterCount(modelPtr)),
      (this.minimumValues = new Float32Array(
        _em.HEAPF32.buffer,
        _csm.getParameterMinimumValues(modelPtr),
        length
      )),
      (length = _csm.getParameterCount(modelPtr)),
      (this.maximumValues = new Float32Array(
        _em.HEAPF32.buffer,
        _csm.getParameterMaximumValues(modelPtr),
        length
      )),
      (length = _csm.getParameterCount(modelPtr)),
      (this.defaultValues = new Float32Array(
        _em.HEAPF32.buffer,
        _csm.getParameterDefaultValues(modelPtr),
        length
      )),
      (length = _csm.getParameterCount(modelPtr)),
      (this.values = new Float32Array(
        _em.HEAPF32.buffer,
        _csm.getParameterValues(modelPtr),
        length
      ));
  }
}
export class Parts {
  /** Part count. */
  count: number;
  /** Part IDs. */
  ids: Array<string>;
  /** Opacity values. */
  opacities: Float32Array;
  /** Part's parent part indices. */
  parentIndices: Int32Array;
  /**
   * Initializes instance.
   *
   * @param modelPtr Native model.
   */
  constructor(modelPtr: number) {
    let length = 0;
    (this.count = _csm.getPartCount(modelPtr)),
      (length = _csm.getPartCount(modelPtr)),
      (this.ids = new Array(length));
    for (
      let _ids = new Uint32Array(
          _em.HEAPU32.buffer,
          _csm.getPartIds(modelPtr),
          length
        ),
        i = 0;
      i < _ids.length;
      i++
    ) {
      this.ids[i] = _em.UTF8ToString(_ids[i]);
    }
    (length = _csm.getPartCount(modelPtr)),
      (this.opacities = new Float32Array(
        _em.HEAPF32.buffer,
        _csm.getPartOpacities(modelPtr),
        length
      )),
      (length = _csm.getPartCount(modelPtr)),
      (this.parentIndices = new Int32Array(
        _em.HEAP32.buffer,
        _csm.getPartParentPartIndices(modelPtr),
        length
      ));
  }
}
export class Drawables {
  /** Drawable count. */
  count: number;
  /** Drawable IDs. */
  ids: Array<string>;
  /** Constant drawable flags. */
  constantFlags: Uint8Array;
  /** Dynamic drawable flags. */
  dynamicFlags: Uint8Array;
  /** Drawable texture indices. */
  textureIndices: Int32Array;
  /** Drawable draw orders. */
  drawOrders: Int32Array;
  /** Drawable render orders. */
  renderOrders: Int32Array;
  /** Drawable opacities. */
  opacities: Float32Array;
  /** Mask count for each drawable. */
  maskCounts: Int32Array;
  /** Masks for each drawable. */
  masks: Array<Int32Array>;
  /** Number of vertices of each drawable. */
  vertexCounts: Int32Array;
  /** 2D vertex position data of each drawable. */
  vertexPositions: Array<Float32Array>;
  /** 2D texture coordinate data of each drawables. */
  vertexUvs: Array<Float32Array>;
  /** Number of triangle indices for each drawable. */
  indexCounts: Int32Array;
  /** Triangle index data for each drawable. */
  indices: Array<Uint16Array>;
  /** Resets all dynamic drawable flags.. */
  private _modelPtr: number;
  constructor(modelPtr: number) {
    this._modelPtr = modelPtr;
    let length = 0,
      length2 = null;
    (this.count = _csm.getDrawableCount(modelPtr)),
      (length = _csm.getDrawableCount(modelPtr)),
      (this.ids = new Array(length));
    // tslint:disable-next-line: no-var-keyword
    for (
      var _ids = new Uint32Array(
          _em.HEAPU32.buffer,
          _csm.getDrawableIds(modelPtr),
          length
        ),
        i = 0;
      i < _ids.length;
      i++
    ) {
      this.ids[i] = _em.UTF8ToString(_ids[i]);
    }
    (length = _csm.getDrawableCount(modelPtr)),
      (this.constantFlags = new Uint8Array(
        _em.HEAPU8.buffer,
        _csm.getDrawableConstantFlags(modelPtr),
        length
      )),
      (length = _csm.getDrawableCount(modelPtr)),
      (this.dynamicFlags = new Uint8Array(
        _em.HEAPU8.buffer,
        _csm.getDrawableDynamicFlags(modelPtr),
        length
      )),
      (length = _csm.getDrawableCount(modelPtr)),
      (this.textureIndices = new Int32Array(
        _em.HEAP32.buffer,
        _csm.getDrawableTextureIndices(modelPtr),
        length
      )),
      (length = _csm.getDrawableCount(modelPtr)),
      (this.drawOrders = new Int32Array(
        _em.HEAP32.buffer,
        _csm.getDrawableDrawOrders(modelPtr),
        length
      )),
      (length = _csm.getDrawableCount(modelPtr)),
      (this.renderOrders = new Int32Array(
        _em.HEAP32.buffer,
        _csm.getDrawableRenderOrders(modelPtr),
        length
      )),
      (length = _csm.getDrawableCount(modelPtr)),
      (this.opacities = new Float32Array(
        _em.HEAPF32.buffer,
        _csm.getDrawableOpacities(modelPtr),
        length
      )),
      (length = _csm.getDrawableCount(modelPtr)),
      (this.maskCounts = new Int32Array(
        _em.HEAP32.buffer,
        _csm.getDrawableMaskCounts(modelPtr),
        length
      )),
      (length = _csm.getDrawableCount(modelPtr)),
      (this.vertexCounts = new Int32Array(
        _em.HEAP32.buffer,
        _csm.getDrawableVertexCounts(modelPtr),
        length
      )),
      (length = _csm.getDrawableCount(modelPtr)),
      (this.indexCounts = new Int32Array(
        _em.HEAP32.buffer,
        _csm.getDrawableIndexCounts(modelPtr),
        length
      )),
      (length = _csm.getDrawableCount(modelPtr)),
      (length2 = new Int32Array(
        _em.HEAP32.buffer,
        _csm.getDrawableMaskCounts(modelPtr),
        length
      )),
      (this.masks = new Array(length));
    const _masks = new Uint32Array(
      _em.HEAPU32.buffer,
      _csm.getDrawableMasks(modelPtr),
      length
    );
    for (i = 0; i < _masks.length; i++) {
      this.masks[i] = new Int32Array(_em.HEAP32.buffer, _masks[i], length2[i]);
    }
    (length = _csm.getDrawableCount(modelPtr)),
      (length2 = new Int32Array(
        _em.HEAP32.buffer,
        _csm.getDrawableVertexCounts(modelPtr),
        length
      )),
      (this.vertexPositions = new Array(length));
    const _vertexPositions = new Uint32Array(
      _em.HEAPU32.buffer,
      _csm.getDrawableVertexPositions(modelPtr),
      length
    );
    for (i = 0; i < _vertexPositions.length; i++) {
      this.vertexPositions[i] = new Float32Array(
        _em.HEAPF32.buffer,
        _vertexPositions[i],
        2 * length2[i]
      );
    }
    (length = _csm.getDrawableCount(modelPtr)),
      (length2 = new Int32Array(
        _em.HEAP32.buffer,
        _csm.getDrawableVertexCounts(modelPtr),
        length
      )),
      (this.vertexUvs = new Array(length));
    const _vertexUvs = new Uint32Array(
      _em.HEAPU32.buffer,
      _csm.getDrawableVertexUvs(modelPtr),
      length
    );
    for (i = 0; i < _vertexUvs.length; i++) {
      this.vertexUvs[i] = new Float32Array(
        _em.HEAPF32.buffer,
        _vertexUvs[i],
        2 * length2[i]
      );
    }
    (length = _csm.getDrawableCount(modelPtr)),
      (length2 = new Int32Array(
        _em.HEAP32.buffer,
        _csm.getDrawableIndexCounts(modelPtr),
        length
      )),
      (this.indices = new Array(length));
    const _indices = new Uint32Array(
      _em.HEAPU32.buffer,
      _csm.getDrawableIndices(modelPtr),
      length
    );
    for (i = 0; i < _indices.length; i++) {
      this.indices[i] = new Uint16Array(
        _em.HEAPU16.buffer,
        _indices[i],
        length2[i]
      );
    }
  }
  resetDynamicFlags(): void {
    _csm.resetDrawableDynamicFlags(this._modelPtr);
  }
}
// tslint:disable-next-line: typedef
export let Utils = (function () {
  function Utils(): void {}
  return (
    (Utils.hasBlendAdditiveBit = function (bitfield: number): boolean {
      return 1 == (1 & bitfield);
    }),
    (Utils.hasBlendMultiplicativeBit = function (bitfield: number): boolean {
      return 2 == (2 & bitfield);
    }),
    (Utils.hasIsDoubleSidedBit = function (bitfield: number): boolean {
      return 4 == (4 & bitfield);
    }),
    (Utils.hasIsInvertedMaskBit = function (bitfield: number): boolean {
      return 8 == (8 & bitfield);
    }),
    (Utils.hasIsVisibleBit = function (bitfield: number): boolean {
      return 1 == (1 & bitfield);
    }),
    (Utils.hasVisibilityDidChangeBit = function (bitfield: number): boolean {
      return 2 == (2 & bitfield);
    }),
    (Utils.hasOpacityDidChangeBit = function (bitfield: number): boolean {
      return 4 == (4 & bitfield);
    }),
    (Utils.hasDrawOrderDidChangeBit = function (bitfield: number): boolean {
      return 8 == (8 & bitfield);
    }),
    (Utils.hasRenderOrderDidChangeBit = function (bitfield: number): boolean {
      return 16 == (16 & bitfield);
    }),
    (Utils.hasVertexPositionsDidChangeBit = function (
      bitfield: number
    ): boolean {
      return 32 == (32 & bitfield);
    }),
    Utils
  );
})();
