// Ảnh minh họa (Metro cần require tĩnh). Ghi đè file PNG trong packages/shared/images để dùng ảnh thật.
export const images = {
  gate: require("@palaceguide/shared/images/gate.png"),
  history: require("@palaceguide/shared/images/history.png"),
  architecture: require("@palaceguide/shared/images/architecture.png"),
  reunification: require("@palaceguide/shared/images/reunification.png"),
  credentials: require("@palaceguide/shared/images/credentials.png"),
  reception: require("@palaceguide/shared/images/reception.png"),
  presidentRoom: require("@palaceguide/shared/images/presidentRoom.png"),
  cabinet: require("@palaceguide/shared/images/cabinet.png"),
  office: require("@palaceguide/shared/images/office.png"),
  family: require("@palaceguide/shared/images/family.png"),
  rooftop: require("@palaceguide/shared/images/rooftop.png"),
  bunker: require("@palaceguide/shared/images/bunker.png"),
  garden: require("@palaceguide/shared/images/garden.png"),
  vehicles: require("@palaceguide/shared/images/vehicles.png"),
  exhibition: require("@palaceguide/shared/images/exhibition.png"),
};

export const imageFor = (id) => images[id] || null;
