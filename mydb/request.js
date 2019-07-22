const {
  MongoClient,
  ObjectId
} = require("mongodb");
const getQuery = require("./query");
const mongodbUrl = "mongodb://localhost:27017/";

exports.mongodbDealData = function (req, res) {
  MongoClient.connect(
    mongodbUrl, {
      useNewUrlParser: true
    },
    function (err, db) {
      if (err) throw err;
      const dbo = db.db("shopping");
      dealQuery(req, res, dbo, db);
    }
  );
};

function dealQuery(req, res, dbo, db) {
  const query = req.query;
  const body = req.body;
  const method = req.method;
  const url = req._parsedUrl.pathname;
  const urlList = url.split("/");
  const len = urlList.length;
  const tableName = urlList[len - 2];
  const operate = urlList[len - 1];
  let count;

  const operations = {
    list: function () {
      const keys = Object.keys(query);
      const len = keys.length;
      const sortTypes = {
        "+": 1,
        "-": -1
      };
      let page,
        limit = 20,
        skip = 0,
        sort = {};

      const where = {};
      for (let i = 0; i < len; i++) {
        const key = keys[i];
        const value = query[key];
        if (key === "sort") {
          const type = value.substring(0, 1);
          if (type === "+" || type === "-") {
            sort[value.substring(1)] = sortTypes[type];
            continue;
          }
        } else if (key === "page") {
          page = value;
          continue;
        } else if (key === "limit") {
          limit = +value;
          continue;
        }
        // where[key] = value;
        where[key] = new RegExp(value);
      }

      if (page && limit) {
        skip = (page - 1) * limit;
      }

      dbo
        .collection(tableName)
        .find(where)
        .count(function (err, results) {
          if (err) throw err;
          count = results;
        });

      if (tableName === "products") {
        queryProducts(where);
        return false;
      }

      if (tableName === "customers") {
        queryCustomers(where);
        return false;
      }


      dbo
        .collection(tableName)
        .find(where)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray(dealResult);
    },
    create: function () {
      Object.keys(body).forEach(key => {
        if (/id/.test(key.toLowerCase())) {
          body[key] = ObjectId(body[key]);
        }
      });
      dbo.collection(tableName).insertOne(body, dealResult);

    },
    update: function () {
      Object.keys(body).forEach(key => {
        if (/id/.test(key.toLowerCase())) {
          body[key] = ObjectId(body[key]);
        }
      });
      const where = {
        _id: body._id
      };
      delete body._id;
      const update = {
        $set: body
      };
      dbo.collection(tableName).updateOne(where, update, dealResult);

      //更新订单记录的同时，更新积分记录
      if (tableName === "orders") {
        updateIntegrals({
          orderId: where._id
        })
      }
    },
    delete: function () {
      const where = {
        _id: ObjectId(query._id)
      };
      dbo.collection(tableName).deleteOne(where, dealResult);

      //删除订单记录的同时，删除对应积分记录
      if (tableName === "orders") {
        dbo.collection("integrals").deleteOne({
          orderId: where._id
        }, dealResult);
      }
    },
    kv: function () {
      let keys = Object.keys(query);
      let project = {};
      if (keys.length) {
        keys.forEach(key => {
          project[key] = 1;
        });
      } else {
        project.name = 1;
      }

      dbo
        .collection(tableName)
        .find()
        .project(project)
        .toArray(dealResult);
    },
    search: function () {
      let project = {
        name: 1
      };
      const where = {
        name: new RegExp(query.name)
      };

      dbo
        .collection(tableName)
        .find(where)
        .project(project)
        .toArray(dealResult);
    }
  };
  const dealResult = (err, results) => {
    if (err) throw err;
    // console.log("The result is: ", results);
    const result = {
      msg: "ok",
      code: 0
    };
    const list = ["list", "kv", "search"];
    if (list.includes(operate)) {
      result.data = results;
      result.total = count;
    }
    res.json(result);

    //添加订单记录的同时，增加积分记录
    if (tableName === "orders" && operate === "create") {
      insertIntegrals(results.orderId);
    }
    // db.close();
  };

  const queryProducts = where => {
    dbo
      .collection(tableName)
      .aggregate([{
          $match: where
        }, //查询条件
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "productId",
            as: "orders"
          }
        },
        {
          $unwind: {
            // 拆分子数组
            path: "$orders",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
          }
        },
        {
          // 分组求和并返回
          $group: {
            // 分组查询
            _id: "$_id",
            name: {
              $first: "$name"
            },
            star: {
              $first: "$star"
            },
            typeId: {
              $first: "$typeId"
            },
            specId: {
              $first: "$specId"
            },
            brandId: {
              $first: "$brandId"
            },
            updateDate: {
              $first: "$updateDate"
            },
            createDate: {
              $first: "$createDate"
            },
            remarks: {
              $first: "$remarks"
            },
            volume: {
              $sum: "$orders.quantity"
            }
          }
        }
      ])
      .toArray(dealResult);
  };

  const queryCustomers = where => {
    dbo
      .collection(tableName)
      .aggregate([{
          $match: where
        }, //查询条件
        {
          $lookup: {
            from: "integrals",
            localField: "_id",
            foreignField: "customerId",
            as: "integrals"
          }
        },
        {
          $unwind: {
            // 拆分子数组
            path: "$integrals",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
          }
        },
        {
          // 分组求和并返回
          $group: {
            // 分组查询
            _id: "$_id",
            name: {
              $first: "$name"
            },
            phone: {
              $first: "$phone"
            },
            address: {
              $first: "$address"
            },
            updateDate: {
              $first: "$updateDate"
            },
            remarks: {
              $first: "$remarks"
            },
            integral: {
              $sum: "$integrals.integral"
            }
          }
        }
      ])
      .toArray(dealResult);
  };

  const insertIntegrals = orderId => {
    const integral = body.sellOutCurrency === "RMB" ? body.sellOut : Math.floor(body.sellOut * body.exchangeRate);
    const obj = {
      customerId: body.customerId,
      orderId,
      integral,
      createDate: body.createDate,
      updateDate: body.updateDate
    }
    dbo.collection("integrals").insertOne(obj, dealResult);
  }
  const updateIntegrals = where => {
    const integral = body.sellOutCurrency === "RMB" ? body.sellOut : Math.floor(body.sellOut * body.exchangeRate);
    const obj = {
      customerId: body.customerId,
      integral,
      updateDate: body.updateDate
    }
    dbo.collection("integrals").updateOne(where, obj, dealResult);
  }

  operations[operate]();
}