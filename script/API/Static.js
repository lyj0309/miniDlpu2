import API from './API'



export class Static extends API {
    url = "/static";
}


class Assets extends API{

}

Assets.FAQ = class FAQ extends Assets {
    url = '/assets/FAQ.json'

}

Assets.AboutUs = class AboutUs extends Assets {
    url = '/assets/aboutUs'
}

