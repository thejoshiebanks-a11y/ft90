/* FT90 visuals: Vinh Stadium (NGUYENNGHIAKK, CC-BY-4.0) replaces the procedural bowl.
   Model is pre-aligned: pitch centre (0,0,0), goal lines x=+-55, rotated so its dugouts and tunnel mouth are on the -Z side,
   with a carved corridor/room for the players' tunnel (x+-5, z-30..-64) and dressing room (x+-14, z-63..-87). */
(function(){
 if(!(THREE&&THREE.GLTFLoader)){console.warn('FT90 visuals: GLTFLoader missing, keeping procedural stadium');return}
 new THREE.GLTFLoader().load('stadium.glb',gltf=>{
  const m=gltf.scene;m.name='FT90_STADIUM_MODEL';
  m.traverse(o=>{if(!o.isMesh)return;o.castShadow=false;o.receiveShadow=false;const mt=o.material;if(!mt)return;
   if(mt.map)mt.map.anisotropy=4;
   if(mt.emissiveMap){mt.emissiveIntensity=2.2}
   if(mt.transparent){mt.depthWrite=false}
   mt.roughness=Math.max(.45,mt.roughness||.8);mt.metalness=Math.min(.3,mt.metalness||0)});
  S.add(m);
  (window.FT90_OLD_BOWL||[]).forEach(o=>{o.visible=false});
  (window.FT90_DUG||[]).forEach(o=>{o.visible=false});
  if(S.fog){S.fog.near=300;S.fog.far=700}
  cam.far=800;cam.updateProjectionMatrix();
  window.FT90_STADIUM=m;console.log('FT90 visuals: stadium model loaded')
 },undefined,e=>console.warn('FT90 visuals: model failed, keeping procedural stadium',e));
})();
