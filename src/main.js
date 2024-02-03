import * as OBC from "openbim-components";
import * as THREE from "three";

const container = document.getElementById('container');

const components = new OBC.Components();
components.scene = new OBC.SimpleScene(components);
components.renderer = new OBC.SimpleRenderer(components, container);
components.camera = new OBC.SimpleCamera(components);
components.raycaster = new OBC.SimpleRaycaster(components);

components.init();

const scene = components.scene.get();

components.camera.controls.setLookAt(10, 10, 10, 0, 0, 0);

const grid = new OBC.SimpleGrid(components);
grid.enabled = false

//const boxMaterial = new THREE.MeshStandardMaterial({ color: '#6528D7' });
//const boxGeometry = new THREE.BoxGeometry(3, 3, 3);
//const cube = new THREE.Mesh(boxGeometry, boxMaterial);
//cube.position.set(0, 1.5, 0);
//scene.add(cube);

components.scene.setup();

const ifcLoader = new OBC.FragmentIfcLoader(components);

ifcLoader.settings.wasm = {
  absolute: true,
  path: "https://unpkg.com/web-ifc@0.0.51/",
};

const highlighter = new OBC.FragmentHighlighter(components);
highlighter.setup();

const propertiesProcessor = new OBC.IfcPropertiesProcessor(components);
highlighter.events.select.onClear.add(() => {
  propertiesProcessor.cleanPropertiesList();
});

const mainToolbar = new OBC.Toolbar(components);
mainToolbar.addChild(
  ifcLoader.uiElement.get("main"),
  propertiesProcessor.uiElement.get("main")
);
components.ui.addToolbar(mainToolbar);

const map = new OBC.MiniMap(components);
components.ui.add(map.uiElement.get("canvas"));

map.lockRotation = false;
map.zoom = 0.2;

const dimensions = new OBC.LengthMeasurement(components);
dimensions.enabled = true;
dimensions.snapDistance = 1;

container.ondblclick = () => dimensions.create();

window.onkeydown = (event) => {
  if (event.code === 'Delete' || event.code === 'Backspace') {
  dimensions.delete();
  }
  }

  mainToolbar.addChild(dimensions.uiElement.get("main"));


  // Simple 2D Scene

  const simple2dScene = new OBC.Simple2DScene(components);

  const scene2d = simple2dScene.get();
  const frustum = new THREE.Frustum();
  const canvasUI = simple2dScene.uiElement.get('container');
  const canvas = canvasUI.domElement;
  window.ondblclick = () => {
  simple2dScene.scaleY += 0.1;
  }


  const mainWindow = new OBC.FloatingWindow(components);
  components.ui.add(mainWindow);
  mainWindow.visible = false;
  mainWindow.domElement.style.height = '20rem';
  mainWindow.addChild(simple2dScene.uiElement.get('container'));
  mainWindow.onResized.add(() => simple2dScene.grid.regenerate());
  components.renderer.onAfterUpdate.add(() => {
  if (mainWindow.visible) {
  simple2dScene.update();
  }
  });
  mainWindow.slots.content.domElement.style.padding = '0';
  mainWindow.slots.content.domElement.style.overflow = 'hidden';
  mainWindow.onResized.add(() => {
  const { width, height } = mainWindow.containerSize;
  simple2dScene.setSize(height, width);
  });
  mainWindow.domElement.style.width = '20rem';
  mainWindow.domElement.style.height = '20rem';
  mainWindow.onVisible.add(() => {
  if(mainWindow.visible) {
  simple2dScene.grid.regenerate()
  }
  })
  const mainButton = new OBC.Button(components);
  mainButton.materialIcon = 'fact_check';
  mainButton.tooltip = '2D scene';
  mainButton.onClick.add(() => {
  mainWindow.visible = !mainWindow.visible;
  });

  mainToolbar.addChild(mainButton);

