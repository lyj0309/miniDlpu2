import API from "./API";

export default class Static extends API {

  url = "/static";

  limit = 1;
  showLoading = true;
  showSucc = true;
  showFail = true;
  showNetwork = 1;

  params=[
    {
      name: "hello",
      test: (d)=>d<=1,
      parse: (d)=>d+"sds"
    }
  ]

  params={
    name: "kk"
  }

}

class User extends Static{

  params={
    name: "cookie"
  }
}

