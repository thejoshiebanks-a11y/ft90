/* FT90 visuals: loads the real stadium model (Modern Stadium by Razny, Sketchfab) and swaps out the old procedural bowl.
   Falls back to the old stadium automatically if the model fails to load. Model is pre-aligned: pitch centre = (0,0,0), goals at x=+-55, dugouts on +Z side. */
(function(){
 if(typeof GLTFLoader==='undefined'&&!(THREE&&THREE.GLTFLoader)){console.warn('FT90 visuals: GLTFLoader missing, keeping procedural stadium');return}
 const L=new THREE.GLTFLoader();
 L.load('stadium.glb',gltf=>{
  const m=gltf.scene;m.name='FT90_STADIUM_MODEL';
  m.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;const mt=o.material;
   if(mt){mt.side=THREE.FrontSide;if(mt.map){mt.map.anisotropy=4}if(mt.name&&/glass/i.test(mt.name)){mt.transparent=true;mt.depthWrite=false}}}});
  S.add(m);
  (window.FT90_OLD_BOWL||[]).forEach(o=>{o.visible=false});
  if(S.fog){S.fog.near=260;S.fog.far=620}
  cam.far=700;cam.updateProjectionMatrix();
  window.FT90_STADIUM=m;console.log('FT90 visuals: stadium model loaded')
 },undefined,e=>console.warn('FT90 visuals: model failed, keeping procedural stadium',e));
})();
