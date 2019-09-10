vec3 rotateX(vec3 p, float theta){
  float s = sin(theta);
  float c = cos(theta);
  return vec3(p.x, p.y * c - p.z * s, p.z * c + p.y * s);
}

vec3 rotateY(vec3 p, float theta) {
  float s = sin(theta);
  float c = cos(theta);
  return vec3(p.x * c + p.z * s, p.y, p.z * c - p.x * s);
}

vec3 rotateZ(vec3 p, float theta) {
  float s = sin(theta);
  float c = cos(theta);
  return vec3(p.x * c - p.y * s, p.y * c + p.x * s, p.z);
}

