import React, { useState, useEffect, useRef, useMemo } from 'react';
import { VoxelEngine } from './services/VoxelEngine';
import { UIOverlay } from './components/UIOverlay';
import { RiggingOverlay } from './components/RiggingOverlay';
import { EditingOverlay } from './components/EditingOverlay';
import { PromptModal } from './components/PromptModal';
import { JsonModal } from './components/JsonModal';

import { SettingsOverlay } from './components/SettingsOverlay';
import { RenderSettingsOverlay, RenderSettings, DEFAULT_RENDER_SETTINGS } from './components/RenderSettingsOverlay';
import { SplashScreen } from './components/SplashScreen';
import { AppState, VoxelData, SymmetryConfig, SavedModel, DetailLevel, Pose, VoxelMaterial, SceneObject } from './types';
import { Generators } from './utils/voxelGenerators';
import { SKELETONS } from './utils/riggingConstants';

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<VoxelEngine | null>(null);

  const [appState, setAppState] = useState<AppState>(AppState.STABLE);
  const [voxelCount, setVoxelCount] = useState<number>(0);

  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonModalMode, setJsonModalMode] = useState<'view' | 'import'>('view');

  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [promptMode, setPromptMode] = useState<'create' | 'morph' | 'rebuild'>('create');

  const [isGenerating, setIsGenerating] = useState(false);

  const [jsonData, setJsonData] = useState('');
  const [isAutoRotate, setIsAutoRotate] = useState(() => {
    try { const s = localStorage.getItem('voxelBuilderAutoRotate'); return s !== null ? JSON.parse(s) : true; }
    catch { return true; }
  });
  const [showGrid, setShowGrid] = useState(() => {
    try { const s = localStorage.getItem('voxelBuilderShowGrid'); return s !== null ? JSON.parse(s) : false; }
    catch { return false; }
  });

  const [symmetry, setSymmetry] = useState<SymmetryConfig>({ x: false, y: false, z: false });
  const [brushType, setBrushType] = useState<'single' | 'sphere' | 'box'>('single');
  const [brushSize, setBrushSize] = useState<number>(1);
  const [currentMaterial, setCurrentMaterial] = useState<VoxelMaterial>(VoxelMaterial.STANDARD);

  const [currentBaseModel, setCurrentBaseModel] = useState<string>('RedFox');
  const [customBuilds, setCustomBuilds] = useState<SavedModel[]>(() => {
    try { const s = localStorage.getItem('voxelBuilderCustomBuilds'); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });
  const [customRebuilds, setCustomRebuilds] = useState<SavedModel[]>(() => {
    try { const s = localStorage.getItem('voxelBuilderCustomRebuilds'); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });
  const [promptHistory, setPromptHistory] = useState<{timestamp: number, prompt: string, snapshot: any}[]>(() => {
    try { const s = localStorage.getItem('voxelBuilderPromptHistory'); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });

  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>(() => {
    try { const s = localStorage.getItem('voxelBuilderSceneObjects'); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('voxelBuilderSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    return {
      apiType: 'proxy',
      apiKey: '',
      localUrl: 'http://localhost:4269/api/generate',
      apiEndpoint: 'https://api.openai.com/v1/chat/completions',
      modelName: 'gpt-4o',
      backgroundColor: '#0d1117',
      gridColor: '#3a4a60'
    };
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRenderSettingsOpen, setIsRenderSettingsOpen] = useState(false);
  const [renderSettings, setRenderSettings] = useState<RenderSettings>(DEFAULT_RENDER_SETTINGS);
  const [showSplash, setShowSplash] = useState(true);

  const relevantRebuilds = useMemo(() => {
      return customRebuilds.filter(r => r.baseModel === currentBaseModel);
  }, [customRebuilds, currentBaseModel]);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new VoxelEngine(
      containerRef.current,
      (newState) => setAppState(newState),
      (count) => setVoxelCount(count)
    );

    engineRef.current = engine;

    engine.loadInitialModel(Generators.RedFox());

    const savedSettings = localStorage.getItem('voxelBuilderSettings');
    if (savedSettings) {
      try {
        const s = JSON.parse(savedSettings);
        if (s.backgroundColor) engine.setBackgroundColor(s.backgroundColor);
        if (s.gridColor) engine.setGridColor(s.gridColor);
      } catch { /* ignore */ }
    }

    const savedScene = localStorage.getItem('voxelBuilderSceneObjects');
    if (savedScene) {
      try {
        const objs: SceneObject[] = JSON.parse(savedScene);
        objs.forEach(obj => engine.placeInScene(obj));
      } catch { /* ignore */ }
    }

    const handleResize = () => engine.handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.cleanup();
    };
  }, []);

  useEffect(() => { localStorage.setItem('voxelBuilderCustomBuilds', JSON.stringify(customBuilds)); }, [customBuilds]);
  useEffect(() => { localStorage.setItem('voxelBuilderCustomRebuilds', JSON.stringify(customRebuilds)); }, [customRebuilds]);
  useEffect(() => { localStorage.setItem('voxelBuilderPromptHistory', JSON.stringify(promptHistory)); }, [promptHistory]);
  useEffect(() => { localStorage.setItem('voxelBuilderAutoRotate', JSON.stringify(isAutoRotate)); }, [isAutoRotate]);
  useEffect(() => { localStorage.setItem('voxelBuilderShowGrid', JSON.stringify(showGrid)); }, [showGrid]);
  useEffect(() => { localStorage.setItem('voxelBuilderSceneObjects', JSON.stringify(sceneObjects)); }, [sceneObjects]);

  const handleRebuild = (type: 'RedFox' | 'Deer') => {
    if (engineRef.current) {
      const generator = type === 'RedFox' ? Generators.RedFox : Generators.Deer;
      engineRef.current.rebuild(generator());
      setCurrentBaseModel(type);
    }
  };

  const handleNewScene = (type: 'RedFox') => {
    if (engineRef.current) {
      const generator = Generators.RedFox;
      engineRef.current.loadInitialModel(generator());
      setCurrentBaseModel('RedFox');
    }
  };

  const handleNewEmptyScene = () => {
    engineRef.current?.loadInitialModel([]);
    setCurrentBaseModel('New Scene');
  };

  const handleRenameBuild = (model: SavedModel) => {
    const newName = window.prompt('Rename build:', model.name);
    if (newName && newName.trim() && newName !== model.name) {
      setCustomBuilds(prev => prev.map(b => b.name === model.name ? { ...b, name: newName.trim() } : b));
    }
  };

  const handleSelectCustomBuild = (model: SavedModel) => {
      if (engineRef.current) {
          engineRef.current.loadInitialModel(model.data);
          setCurrentBaseModel(model.name);
      }
  };

  const handleSelectCustomRebuild = (model: SavedModel) => {
      if (engineRef.current) {
          engineRef.current.rebuild(model.data);
      }
  };

  const handleDeleteCustomBuild = (model: SavedModel) => {
      setCustomBuilds(prev => prev.filter(m => m.name !== model.name));
  };

  const handleDeleteCustomRebuild = (model: SavedModel) => {
      setCustomRebuilds(prev => prev.filter(m => m.name !== model.name));
  };

  const handlePlaceInScene = (model: SavedModel) => {
      const id = `scene-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const offsetX = (sceneObjects.length + 1) * 30;
      const newObj: SceneObject = { id, name: model.name, data: model.data, offsetX, offsetZ: 0 };
      engineRef.current?.placeInScene(newObj);
      setSceneObjects(prev => [...prev, newObj]);
  };

  const handleRemoveFromScene = (id: string) => {
      engineRef.current?.removeFromScene(id);
      setSceneObjects(prev => prev.filter(o => o.id !== id));
  };

  const handleMoveSceneObject = (id: string, dx: number, dz: number) => {
      setSceneObjects(prev => {
          const updated = prev.map(o => {
              if (o.id !== id) return o;
              const moved = { ...o, offsetX: o.offsetX + dx, offsetZ: o.offsetZ + dz };
              engineRef.current?.placeInScene(moved);
              return moved;
          });
          return updated;
      });
  };

  const handleClearScene = () => {
      engineRef.current?.clearScene();
      setSceneObjects([]);
  };

  const handleSaveBuild = () => {
      if (engineRef.current) {
          const name = prompt("Enter a name for this build:", currentBaseModel);
          if (name) {
              const dataStr = engineRef.current.getJsonData();
              const rawData = JSON.parse(dataStr);
              const data = rawData.map((v: any) => {
                  let colorStr = v.c;
                  if (colorStr.startsWith('#')) colorStr = colorStr.substring(1);
                  return {
                      x: v.x,
                      y: v.y,
                      z: v.z,
                      color: parseInt(colorStr, 16)
                  }
              });
              setCustomBuilds(prev => [...prev, { name, data }]);
          }
      }
  };

  const handleShowJson = () => {
    if (engineRef.current) {
      setJsonData(engineRef.current.getJsonData());
      setJsonModalMode('view');
      setIsJsonModalOpen(true);
    }
  };

  const handleImportClick = () => {
    setJsonData('');
    setJsonModalMode('import');
    setIsJsonModalOpen(true);
  };

  const handleJsonImport = (rawJson: string) => {
    if (!engineRef.current) return;
    try {
      const parsed = JSON.parse(rawJson);
      if (!Array.isArray(parsed)) throw new Error('Expected a JSON array');
      const data: VoxelData[] = parsed.map((v: any) => {
        let color: number;
        if (typeof v.color === 'number') {
          color = v.color;
        } else if (typeof v.c === 'string') {
          color = parseInt(v.c.replace('#', ''), 16);
        } else if (typeof v.color === 'string') {
          color = parseInt(v.color.replace('#', ''), 16);
        } else {
          color = 0xCCCCCC;
        }
        return { x: v.x || 0, y: v.y || 0, z: v.z || 0, color, bone: v.bone, weights: v.weights, materialType: v.materialType, isLocked: v.isLocked };
      });
      engineRef.current.loadInitialModel(data);
      setCurrentBaseModel('Imported Model');
    } catch (e: any) {
      alert('JSON Import Failed: ' + e.message);
    }
  };

  const handleExportGLTF = (includeAnimations: boolean = true) => {
    if (engineRef.current) {
      engineRef.current.exportGLTF(includeAnimations);
    }
  };

  const handleExportOBJ = () => {
    if (engineRef.current) {
      engineRef.current.exportOBJ();
    }
  };

  const handleToggleRotation = () => {
    setIsAutoRotate(!isAutoRotate);
    if (engineRef.current) {
      engineRef.current.setAutoRotate(!isAutoRotate);
    }
  };

  const handleToggleGrid = () => {
    setShowGrid(!showGrid);
    if (engineRef.current) {
      engineRef.current.setGridVisible(!showGrid);
    }
  };

  const handleEnterRigging = () => {
      if (engineRef.current) {
          engineRef.current.enterRiggingMode();
      }
  };

  const handleExitRigging = () => {
      if (engineRef.current) {
          engineRef.current.exitRiggingMode();
      }
  };

  const handleEnterEditing = () => {
      if (engineRef.current) {
          engineRef.current.enterEditingMode();
      }
  };

  const handleExitEditing = () => {
      if (engineRef.current) {
          engineRef.current.exitEditingMode();
      }
  };

  const handleSetSymmetry = (config: SymmetryConfig) => {
      setSymmetry(config);
      engineRef.current?.setSymmetry(config.x, config.y, config.z);
  };

  const handleSetBrushType = (type: 'single' | 'sphere' | 'box') => {
      setBrushType(type);
      engineRef.current?.setBrushType(type);
  };

  const handleSetBrushSize = (size: number) => {
      setBrushSize(size);
      engineRef.current?.setBrushSize(size);
  };

  const handleSetMaterial = (material: VoxelMaterial) => {
      setCurrentMaterial(material);
      engineRef.current?.setEditMaterial(material);
  };

  const handleUndo = () => engineRef.current?.undo();
  const handleRedo = () => engineRef.current?.redo();

  const openPrompt = (mode: 'create' | 'morph' | 'rebuild') => {
      setPromptMode(mode);
      setIsPromptModalOpen(true);
  };

  const handlePromptSubmit = async (prompt: string, detail: DetailLevel, pose: Pose) => {
    setIsGenerating(true);
    try {
        const systemMessage = `You are a professional 3D voxel architect. You output ONLY a raw JSON array. Your entire response must start with [ and end with ]. No markdown, no code fences, no backticks, no explanation, no text before or after the array. If you include anything other than the JSON array your output is unusable.`;

        let systemContext = `- Use realistic PBR materials (Metal for weapons/armor, Glass for eyes/gems, Emissive for magic/light).
        - Apply color gradients to simulate realistic lighting and depth.`;

        let targetVoxels = detail === DetailLevel.LOW ? "1 to 500" : detail === DetailLevel.MEDIUM ? "500 to 1000" : "1000 to 2000";
        let poseInstruction = "";
        
        switch (pose) {
            case Pose.NEUTRAL_STAND:
                poseInstruction = "Ensure the subject is in a neutral standing posture.";
                break;
            case Pose.WINGS_SPREAD:
                poseInstruction = "Ensure the subject is in a Wings-Spread Glide pose (Bird/Dragon/Bat standard) with wings fully extended horizontally.";
                break;
            case Pose.TORPEDO:
                poseInstruction = "Ensure the subject is in an I-Pose/Torpedo posture (Fish/Snake/Whale standard), perfectly straight and streamlined.";
                break;
            case Pose.STAR_POSE:
                poseInstruction = "Ensure the subject is in a Star-Pose (Spider/Octopus/Insects) with all limbs splayed out evenly from the center.";
                break;
            case Pose.MOUTH_OPEN:
                poseInstruction = "Ensure the subject has its mouth wide open or jaw dropped (Head/Face standard) to allow for internal detail.";
                break;
        }

        if (promptMode === 'create') {
            systemContext += `\nCONTEXT: You are creating a brand new voxel art scene from scratch. You MUST produce between ${targetVoxels} voxels. Hit the minimum for this detail level — do not under-produce. Geometry density is the priority, not token efficiency. A subject that warrants more voxels must use more voxels.`;
        } else if (promptMode === 'rebuild') {
            systemContext += `\nCONTEXT: You are generating the TARGET of a voxel reconstruction animation. The current model will fly apart and reassemble into your output. Generate a complete, detailed new form. You MUST produce between ${targetVoxels} voxels — do not under-produce.`;
        } else {
            let morphVoxels = detail === DetailLevel.LOW ? "500" : detail === DetailLevel.MEDIUM ? "1200" : "2000";
            systemContext += `\nCONTEXT: You are modifying an existing voxel model. Perform "Voxel-Wise Diffing" to only change requested parts while respecting the existing structure and locked flags. Add up to ${morphVoxels} additional voxels for increased detail.`;
        }

        const fullPrompt = `${systemContext}\nTask: Generate voxel model of: "${prompt}".\nRules: Scale within 32x32x32. ${poseInstruction}\nDO NOT write scripts or code to generate the voxels. You must output the RAW JSON array directly.\nReturn ONLY JSON array of {x, y, z, color, materialType}.`;

        let rawData: any[] = [];

        if (settings.apiType === 'direct') {
            const endpoint = settings.apiEndpoint || 'https://api.openai.com/v1/chat/completions';
            const model = settings.modelName || 'gpt-4o';
            let activeSystemMessage = systemMessage;
            try {
                const skillRes = await fetch('http://localhost:4269/api/skill');
                if (skillRes.ok) {
                    const skillData = await skillRes.json();
                    if (skillData.content) activeSystemMessage = skillData.content;
                }
            } catch { /* fall back to default system message if skill unavailable */ }
            const apiResponse = await fetch('http://localhost:4269/api/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint,
                    apiKey: settings.apiKey,
                    model,
                    messages: [{ role: 'system', content: activeSystemMessage }, { role: 'user', content: fullPrompt }],
                    max_tokens: 8192,
                    temperature: 0.7
                })
            });
            if (!apiResponse.ok) {
                const errText = await apiResponse.text();
                throw new Error(`API error ${apiResponse.status}: ${errText.substring(0, 300)}`);
            }
            const apiData = await apiResponse.json();
            let text = apiData.choices?.[0]?.message?.content || '';
            console.log('[VoxelBuilder] Raw API response text:', text);
            // Strip markdown fences and // comments
            text = text.replace(/^```(?:json)?\s*$/gim, '').replace(/^```\s*$/gim, '').trim();
            text = text.replace(/\/\/[^\n]*/g, '');
            let si = text.indexOf('['), ei = text.lastIndexOf(']');
            // If truncated (no closing ]), recover by closing at last complete object
            if (si !== -1 && ei === -1) {
                const lastBrace = text.lastIndexOf('}');
                if (lastBrace > si) text = text.substring(si, lastBrace + 1) + ']';
                si = 0; ei = text.length - 1;
            }
            if (si === -1 || ei === -1 || ei <= si) {
                const objMatch = text.match(/"(?:voxels?|data|array|result|objects?)":\s*(\[[\s\S]*\])/i);
                if (objMatch) {
                    rawData = JSON.parse(objMatch[1]);
                } else {
                    throw new Error(`Model did not return a JSON array. Got: "${text.substring(0, 300)}"`);
                }
            } else {
                rawData = JSON.parse(text.substring(si, ei + 1));
            }
        } else {
            const url = settings.localUrl || 'http://localhost:4269/api/generate';
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    currentGrid: promptMode === 'morph' ? engineRef.current?.getJsonData() : null
                })
            });
            if (!response.ok) {
                let errorMsg = `Server responded with ${response.status}`;
                try {
                    const errData = await response.json();
                    if (errData.error) errorMsg = errData.error;
                    if (errData.details) errorMsg += ': ' + errData.details;
                } catch { /* ignore json parse error on error response */ }
                throw new Error(errorMsg);
            }
            rawData = await response.json();
            console.log('[VoxelBuilder] Bridge response:', Array.isArray(rawData) ? `${rawData.length} voxels` : rawData);
        }

        if (!Array.isArray(rawData)) {
            throw new Error("Invalid response format: Expected a JSON array.");
        }

        const normalizeMaterial = (m: string | undefined): VoxelMaterial => {
            if (!m) return VoxelMaterial.STANDARD;
            const u = m.toUpperCase();
            if (u === 'METALLIC' || u === 'METAL') return VoxelMaterial.METALLIC;
            if (u === 'GLASS') return VoxelMaterial.GLASS;
            if (u === 'EMISSIVE' || u === 'EMIT' || u === 'GLOW' || u === 'EMISSION') return VoxelMaterial.EMISSIVE;
            return VoxelMaterial.STANDARD;
        };
        const voxelData: VoxelData[] = rawData.map(v => {
            const colorStr = typeof v.color === 'string' ? v.color : v.c || '#CCCCCC';
            const colorInt = parseInt(colorStr.replace('#', ''), 16);
            return {
                x: v.x || 0,
                y: v.y || 0,
                z: v.z || 0,
                color: isNaN(colorInt) ? 0xCCCCCC : colorInt,
                materialType: normalizeMaterial(v.materialType)
            };
        });

        if (engineRef.current) {
            const snapshot = JSON.parse(engineRef.current.getJsonData());
            setPromptHistory(prev => [...prev, {
                timestamp: Date.now(),
                prompt: prompt,
                snapshot: snapshot
            }]);

            if (promptMode === 'create') {
                engineRef.current.loadInitialModel(voxelData);
                setCustomBuilds(prev => [...prev, { name: prompt, data: voxelData }]);
                setCurrentBaseModel(prompt);
            } else if (promptMode === 'rebuild') {
                engineRef.current.rebuild(voxelData);
                setCustomRebuilds(prev => [...prev, {
                    name: prompt,
                    data: voxelData,
                    baseModel: currentBaseModel
                }]);
            } else {
                engineRef.current.mergeAIGeneratedModel(voxelData);
                setCustomRebuilds(prev => [...prev, {
                    name: prompt,
                    data: voxelData,
                    baseModel: currentBaseModel
                }]);
            }
        }
    } catch (err: any) {
        console.error("Generation failed", err);
        const errorMsg = err.message || "Something went wrong";
        alert(`Generation Failed: ${errorMsg}`);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSaveSettings = (newSettings: any) => {
      setSettings(newSettings);
      localStorage.setItem('voxelBuilderSettings', JSON.stringify(newSettings));
      if (newSettings.backgroundColor) engineRef.current?.setBackgroundColor(newSettings.backgroundColor);
      if (newSettings.gridColor) engineRef.current?.setGridColor(newSettings.gridColor);
      setIsSettingsOpen(false);
  };

  const handleRenderSettingsChange = (s: RenderSettings) => {
      setRenderSettings(s);
      if (!engineRef.current) return;
      if (s.solidPreview !== renderSettings.solidPreview) engineRef.current.setSolidPreview(s.solidPreview);
      engineRef.current.setBloom(s.bloomEnabled, s.bloomStrength);
      engineRef.current.setToneMapping(s.toneMapping);
      engineRef.current.setBakedAO(s.bakedAO, s.bakedAOStrength);
  };

  const handleResample = (scale: number) => {
      engineRef.current?.resample(scale);
  };

  const handleDismantle = () => {
      engineRef.current?.dismantle();
  };

  const handleRestoreFromSnapshot = () => {
      engineRef.current?.restoreFromSnapshot();
  };

  const handleImageImport = async (file: File) => {
      if (engineRef.current) {
          await engineRef.current.voxelizeImage(file);
          setCurrentBaseModel(file.name);
      }
  };

  const handleMeshImport = async (file: File) => {
      if (!engineRef.current) return;
      const choice = window.prompt(
        'Voxel resolution — enter a number or leave "auto":\n\n  auto  = recommended (snaps to the original grid for Voxel Studio exports)\n  16    = coarse / fast\n  32    = balanced\n  64    = high detail\n  96    = very high (slow on complex models)',
        'auto'
      );
      if (choice === null) return;
      const resolution: number | null = (choice.trim().toLowerCase() === 'auto')
        ? null
        : Math.max(8, Math.min(128, parseInt(choice) || 32));

      try {
          const name = file.name.toLowerCase();
          const isSTL = name.endsWith('.stl');
          const isGLTF = name.endsWith('.glb') || name.endsWith('.gltf');
          const isPLY = name.endsWith('.ply');
          const isFBX = name.endsWith('.fbx');

          if (isSTL) {
              const { STLLoader } = await import('three/addons/loaders/STLLoader.js');
              const loader = new STLLoader();
              const geometry = loader.parse(await file.arrayBuffer());
              const THREE = await import('three');
              const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
              await engineRef.current.voxelizeMesh(mesh, resolution);
          } else if (isPLY) {
              const { PLYLoader } = await import('three/addons/loaders/PLYLoader.js');
              const loader = new PLYLoader();
              const geometry = loader.parse(await file.arrayBuffer());
              const THREE = await import('three');
              const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
              await engineRef.current.voxelizeMesh(mesh, resolution);
          } else if (isFBX) {
              const { FBXLoader } = await import('three/addons/loaders/FBXLoader.js');
              const loader = new FBXLoader();
              const url = URL.createObjectURL(file);
              try {
                  const object = await new Promise<any>((resolve, reject) => {
                      loader.load(url, resolve, undefined, reject);
                  });
                  await engineRef.current.voxelizeMesh(object, resolution);
              } finally {
                  URL.revokeObjectURL(url);
              }
          } else {
              const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
              const { OBJLoader } = await import('three/addons/loaders/OBJLoader.js');
              const loader = isGLTF ? new GLTFLoader() : new OBJLoader();
              const url = URL.createObjectURL(file);
              try {
                  const result = await new Promise<any>((resolve, reject) => {
                      loader.load(url, resolve, undefined, reject);
                  });
                  if (isGLTF) {
                      let embeddedRaw: any[] | null = null;
                      const scene = result.scene;
                      if (scene) {
                          if (Array.isArray(scene.userData?.voxelData)) {
                              embeddedRaw = scene.userData.voxelData;
                          } else {
                              scene.traverse((child: any) => {
                                  if (!embeddedRaw && Array.isArray(child.userData?.voxelData)) {
                                      embeddedRaw = child.userData.voxelData;
                                  }
                              });
                          }
                      }
                      if (embeddedRaw) {
                          const voxelData: VoxelData[] = embeddedRaw.map((v: any) => ({
                              x: v.x, y: v.y, z: v.z,
                              color: parseInt((v.c || '#CCCCCC').replace('#', ''), 16),
                              materialType: v.m || VoxelMaterial.STANDARD,
                              bone: v.b,
                              weights: v.w,
                              isLocked: !!v.l
                          }));
                          engineRef.current.loadInitialModel(voxelData);
                          setCurrentBaseModel(file.name);
                          return;
                      }
                  }
                  const object = result.scene || result;
                  await engineRef.current.voxelizeMesh(object, resolution);
              } finally {
                  URL.revokeObjectURL(url);
              }
          }
          setCurrentBaseModel(file.name);
      } catch (e) {
          console.error("Failed to load mesh", e);
          alert("Failed to load mesh file.");
      }
  };

  const handleVoxImport = async (file: File) => {
      if (!engineRef.current) return;
      try {
          const data = engineRef.current.importVOX(await file.arrayBuffer());
          engineRef.current.loadInitialModel(data);
          setCurrentBaseModel(file.name);
      } catch (e: any) {
          alert('VOX Import Failed: ' + e.message);
      }
  };

  const handleQBImport = async (file: File) => {
      if (!engineRef.current) return;
      try {
          const data = engineRef.current.importQB(await file.arrayBuffer());
          engineRef.current.loadInitialModel(data);
          setCurrentBaseModel(file.name);
      } catch (e: any) {
          alert('QB Import Failed: ' + e.message);
      }
  };

  const handleMinecraftImport = async (file: File) => {
      if (!engineRef.current) return;
      try {
          const data = await engineRef.current.importMinecraft(await file.arrayBuffer());
          engineRef.current.loadInitialModel(data);
          setCurrentBaseModel(file.name);
      } catch (e: any) {
          alert('Minecraft Import Failed: ' + e.message);
      }
  };

  const handleTextVoxelize = (text: string) => {
      engineRef.current?.voxelizeText(text);
  };

  const handleExportHistory = () => {
      if (promptHistory.length === 0) {
          alert("No history to export yet.");
          return;
      }
      const data = JSON.stringify(promptHistory, null, 2);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
      link.download = 'voxel-prompt-history.json';
      link.click();
  };

  const isRigging = appState === AppState.RIGGING;
  const isEditing = appState === AppState.EDITING;

  return (
    <div className="relative w-full h-screen bg-[#0d1117] overflow-hidden">
      {showSplash && <SplashScreen onEnter={() => setShowSplash(false)} />}
      <div ref={containerRef} className="absolute inset-0" />

      <div className="absolute inset-0 pointer-events-none">
        {!isRigging && !isEditing && (
            <UIOverlay
              voxelCount={voxelCount}
              appState={appState}
              currentBaseModel={currentBaseModel}
              customBuilds={customBuilds}
              customRebuilds={relevantRebuilds}
              isAutoRotate={isAutoRotate}
              showGrid={showGrid}
              isGenerating={isGenerating}
              hasSnapshot={engineRef.current?.hasSnapshot || false}
              onDismantle={handleDismantle}
              onRebuild={handleRebuild}
              onNewScene={handleNewScene}
              onNewEmptyScene={handleNewEmptyScene}
              onRenameBuild={handleRenameBuild}
              onSelectCustomBuild={handleSelectCustomBuild}
              onSelectCustomRebuild={handleSelectCustomRebuild}
              onDeleteCustomBuild={handleDeleteCustomBuild}
              onDeleteCustomRebuild={handleDeleteCustomRebuild}
              onSaveBuild={handleSaveBuild}
              onPromptCreate={() => openPrompt('create')}
              onPromptMorph={() => openPrompt('morph')}
              onPromptRebuild={() => openPrompt('rebuild')}
              onShowJson={handleShowJson}
              onImportJson={handleImportClick}
              onExportGLTF={() => handleExportGLTF(false)}
              onExportOBJ={handleExportOBJ}
              onExportFBX={() => handleExportGLTF(true)}
              onExportPLY={() => engineRef.current?.exportPLY()}
              onExportSTL={() => engineRef.current?.exportSTL()}
              onExportVOX={() => engineRef.current?.exportVOX()}
              onExportQB={() => engineRef.current?.exportQB()}
              onExportPNG={() => engineRef.current?.exportPNG()}
              onExportMinecraft={(fmt) => engineRef.current?.exportMinecraft(fmt)}
              onToggleRotation={handleToggleRotation}
              onToggleGrid={handleToggleGrid}
              onResetCamera={() => engineRef.current?.resetCamera()}
              onEnterRigging={handleEnterRigging}
              onEnterEditing={handleEnterEditing}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenRenderSettings={() => setIsRenderSettingsOpen(v => !v)}
              onPlayTimeLapse={() => engineRef.current?.playTimeLapse()}
              onRestoreSnapshot={handleRestoreFromSnapshot}
              onImportImage={handleImageImport}
              onImportMesh={handleMeshImport}
              onImportVox={handleVoxImport}
              onImportQB={handleQBImport}
              onImportMinecraft={handleMinecraftImport}
              onVoxelizeText={handleTextVoxelize}
              onExportHistory={handleExportHistory}
              onGenerateSphere={() => engineRef.current?.generateSphere()}
              onGenerateTerrain={() => engineRef.current?.generateTerrain()}
              onGenerateNoise={() => engineRef.current?.generateNoiseBlob()}
              sceneObjects={sceneObjects}
              onPlaceInScene={handlePlaceInScene}
              onRemoveFromScene={handleRemoveFromScene}
              onMoveSceneObject={handleMoveSceneObject}
              onClearScene={handleClearScene}
              />
              )}

              {isRigging && (
              <RiggingOverlay
                initialSkeleton={engineRef.current?.currentSkeletonDef}
                hasRigData={engineRef.current?.hasRigData || false}
                onClose={handleExitRigging}
                onEnablePaint={(bone, color) => engineRef.current?.enablePainting(bone, color)}
                onDisablePaint={() => engineRef.current?.disablePainting()}
                onAutoRig={(skel) => {
                    engineRef.current?.autoRig(skel);
                    engineRef.current?.buildRigAndPreview(skel);
                }}
                onBuildRig={(skel) => engineRef.current?.buildRigAndPreview(skel)}
                onPlayAnimation={(skel, anim, loop) => {
                    if (engineRef.current?.hasSnapshot) engineRef.current?.restoreFromSnapshot();
                    engineRef.current?.playAnimation(skel, anim, loop);
                }}
                onStopAnimation={() => {
                    if (engineRef.current?.hasSnapshot) engineRef.current?.restoreFromSnapshot();
                    engineRef.current?.exitAnimationPreview();
                }}
                onExplodeRig={() => engineRef.current?.explodeFromRig()}
                onExportGLTF={() => handleExportGLTF(true)}
                onExportGLTFStatic={() => handleExportGLTF(false)}
                onExportOBJ={handleExportOBJ}
                onExportPLY={() => engineRef.current?.exportPLY()}
                onExportSTL={() => engineRef.current?.exportSTL()}
                onExportFBX={() => handleExportGLTF(true)}
                onExportVOX={() => engineRef.current?.exportVOX()}
                onExportQB={() => engineRef.current?.exportQB()}
                onExportPNG={() => engineRef.current?.exportPNG()}
                onExportMinecraft={(fmt) => engineRef.current?.exportMinecraft(fmt)}
                onExportJSON={handleShowJson}
              />
              )}

              {isEditing && (
              <EditingOverlay
                onClose={handleExitEditing}
                onSetEditColor={(color) => engineRef.current?.setEditColor(color)}
                onSetEditMode={(mode) => engineRef.current?.setEditMode(mode)}
                symmetry={symmetry}
                onSetSymmetry={handleSetSymmetry}
                brushType={brushType}
                onSetBrushType={handleSetBrushType}
                brushSize={brushSize}
                onSetBrushSize={handleSetBrushSize}
                currentMaterial={currentMaterial}
                onSetMaterial={handleSetMaterial}
                onUndo={handleUndo}
                onRedo={handleRedo}
                dynamicColors={engineRef.current?.getUniqueColors() || []}
                onFlipModel={(axis) => engineRef.current?.flipModel(axis)}
                onRotateModel={(dir) => engineRef.current?.rotateModel90(dir)}
              />
              )}

      </div>

      <div className="z-[100]">
          <RenderSettingsOverlay
            isOpen={isRenderSettingsOpen}
            onClose={() => setIsRenderSettingsOpen(false)}
            settings={renderSettings}
            onChange={handleRenderSettingsChange}
          />

          <SettingsOverlay
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onSave={handleSaveSettings}
            initialSettings={settings}
            onResample={handleResample}
          />

          <JsonModal
            isOpen={isJsonModalOpen}
            onClose={() => setIsJsonModalOpen(false)}
            data={jsonData}
            isImport={jsonModalMode === 'import'}
            onImport={handleJsonImport}
          />

          <PromptModal
            isOpen={isPromptModalOpen}
            mode={promptMode}
            onClose={() => setIsPromptModalOpen(false)}
            onSubmit={handlePromptSubmit}
          />
      </div>
    </div>
  );
};

export default App;
