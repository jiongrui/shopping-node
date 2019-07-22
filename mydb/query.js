module.exports = function getQuery(req) {
  const query = req.query;
  const url = req._parsedUrl.pathname;
  const urlList = url.split("/");
  const len = urlList.length;
  const tableName = urlList[len - 2];
  const queryObject = {
    "/shopping/products/list": getCommSelectQuery,
    "/shopping/products/create": getCreateQuery,
    "/shopping/products/update": getUpdateQuery,
    "/shopping/product_types/list": getCommSelectQuery,
    "/shopping/product_types/create": getCreateQuery,
    "/shopping/product_types/update": getUpdateQuery,
    "/shopping/product_imps/list": getCommSelectQuery,
    "/shopping/product_imps/create": getCreateQuery,
    "/shopping/product_imps/update": getUpdateQuery,
    "/shopping/product_specs/list": getCommSelectQuery,
    "/shopping/product_specs/create": getCreateQuery,
    "/shopping/product_specs/update": getUpdateQuery
  };
  return queryObject[url](tableName, query);
};

function getCommSelectQuery(table, query) {
  const keys = Object.keys(query);
  const len = keys.length;
  const sortTypes = {
    "+": "asc",
    "-": "desc"
  };
  let page, limit, sort;

  let sql = `select * from ${table} `;
  sql += keys.reduce((acc, key, index) => {
    const value = query[key];
    if (key === "sort") {
      const type = value.substring(0, 1);
      if (type === "+" || type === "-") {
        sort = {
          type: sortTypes[type],
          key: value.substring(1)
        };
      }
      return acc;
    } else if (key === "page") {
      page = value;
      return acc;
    } else if (key === "limit") {
      limit = value;
      return acc;
    }
    return index + 1 < len
      ? (acc += `where ${key}=${value} and `)
      : (acc += `${key}=${value} `);
  }, "");
  sort && (sql += `order by ${sort.key} ${sort.type} `);
  if (page && limit) {
    const begin = (page - 1) * limit;
    sql += `limit ${begin},${limit}`;
  }

  console.log("getCommSelectQuery sql", sql);
  return sql;
}

function getCreateQuery(table, query) {
  const keys = Object.keys(query);
  const values = Object.values(query);
  const sql = `insert into ${table} (${keys.join(",")}) values (${values
    .map(value => `"${value}"`)
    .join(",")})`;
  console.log("getCreateQuery sql", sql);
  return sql;
}

function getUpdateQuery(table, query) {
  const keys = Object.keys(query);
  const len = keys.length;
  const keyValues = keys.reduce((acc, key, index) => {
    return index + 1 < len
      ? (acc += `${key}='${query[key]}',`)
      : (acc += `${key}='${query[key]}'`);
  }, "");
  return `update ${table} set ${keyValues} where id=${query.id}`;
}
