// const GET_API = [
//   "/shopping/orders/list",
//   "/shopping/orders/delete",
//   "/shopping/orders/kv",
//   "/shopping/orders/search",

//   "/shopping/customers/list",
//   "/shopping/customers/delete",
//   "/shopping/customers/kv",
//   "/shopping/customers/search",

//   "/shopping/products/list",
//   "/shopping/products/delete",
//   "/shopping/products/kv",
//   "/shopping/products/search",

//   "/shopping/product_types/list",
//   "/shopping/product_types/delete",
//   "/shopping/product_types/kv",
//   "/shopping/product_types/search",

//   "/shopping/product_specs/list",
//   "/shopping/product_specs/delete",
//   "/shopping/product_specs/kv",
//   "/shopping/product_specs/search",

//   "/shopping/product_brands/list",
//   "/shopping/product_brands/delete",
//   "/shopping/product_brands/kv",
//   "/shopping/product_brands/search"
// ];
// const POST_API = [
//   "/shopping/orders/create",
//   "/shopping/orders/update",
//   "/shopping/customers/create",
//   "/shopping/customers/update",
//   "/shopping/products/create",
//   "/shopping/products/update",
//   "/shopping/product_types/create",
//   "/shopping/product_types/update",
//   "/shopping/product_specs/create",
//   "/shopping/product_specs/update",
//   "/shopping/product_brands/create",
//   "/shopping/product_brands/update"
// ];

const TABLES = [
  'orders', 'customers', 'products', 'product_types', 'product_specs', 'product_brands', 'integrals'
]

const GET_OPERATES = ['list', 'delete', 'kv', 'search']
const POST_OPERATES = ['create', 'update']

const POST_API = [];
const GET_API = [];
POST_OPERATES.forEach(operate => {
  TABLES.forEach(table => {
    POST_API.push(`/shopping/${table}/${operate}`)
  })
})

GET_OPERATES.forEach(operate => {
  TABLES.forEach(table => {
    GET_API.push(`/shopping/${table}/${operate}`)
  })
})


module.exports = {
  GET_API,
  POST_API
};
