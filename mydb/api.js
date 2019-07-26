const TABLES = [
  "orders",
  "customers",
  "products",
  "product_types",
  "product_specs",
  "product_brands",
  "integrals"
];

const GET_OPERATES = ["list", "delete", "kv", "search"];
const POST_OPERATES = ["create", "update"];

const POST_API = [];
const GET_API = [];
POST_OPERATES.forEach(operate => {
  TABLES.forEach(table => {
    POST_API.push(`/shopping/${table}/${operate}`);
  });
});

GET_OPERATES.forEach(operate => {
  TABLES.forEach(table => {
    GET_API.push(`/shopping/${table}/${operate}`);
  });
});

module.exports = {
  GET_API,
  POST_API
};
