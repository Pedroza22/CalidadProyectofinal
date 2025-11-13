export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/tests/**/*.test.(ts|tsx)", "<rootDir>/tests/**/*.spec.(ts|tsx)"],
  moduleNameMapper: {
    "^.+\\.(css|scss|sass|less)$": "identity-obj-proxy",
    "^three/examples/jsm/controls/OrbitControls\\.js$": "<rootDir>/tests/__mocks__/three-orbitcontrols.js",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { useESM: true }],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
};