import Data from "./Data";
import User  from "../API/User";

export  default class UserData extends Data {
    static EXPIRES_TIME = 1000 * 60 * 60 * 10 //过时间

    requestData(){
        return new User({

        })
    }
    constructor() {
        super();
        this._data = null;

        this.regisKey({
            name: 'data',
            getSync: () => new Promise(
                (resolve, reject) => {
                    const now = new Date().getTime()
                    if (this._data && now - this._data.lastGetTime < User.EXPIRES_TIME) { //没过期
                        return resolve(this._data)
                    }


                }
            )
        })
    }
}