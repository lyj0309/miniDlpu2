import API from "./API";

export default class User extends API {
    params = {
        name: "cookie",
        parse: d => "session=" + d,
        isHeader: true
    }

    parseResData = function (d) {

        console.log(d)


        this.succ = true;
        this.errCode = 1;

        // 处理成功情况
        if (d.errcode / 1 === 0) {
            this.succ = true;
            this.errCode = 1;
            return d.errmsg;
        }

        // 处理失败情况
        else {
            this.succ = false;
            this.errCode = d.errcode;
            return d;
        }
    }
}

class Remind extends User {
    params = [
        {
            name: 'week',
            test: String
        },
        {
            name: 'day',
            test: String
        },
        {
            name: 'start',
            test: String
        },
        {
            name: 'end',
            test: String
        },
        {
            name: 'name',
            test: String
        },
        {
            name: 'teacher',
            test: String
        },
        {
            name: 'class',
            test: String
        },
    ]
}

//上课提醒
User.AddTimeTableRemind = class AddTimeTableRemind extends Remind {
    url = '/course_timetable_remind'
    method = User.POST
}

User.DelTimeTableRemind = class DelTimeTableRemind extends Remind {
    url = '/course_timetable_remind'
    method = User.DELETE
}

User.GET_TIME_TABLE = class GET_TIME_TABLE extends User {
    url = '/course_timetable'
    params = {
        name: "semester",
        parse: d => d.slice(0, 11),
        test: String
    }
}

User.ExamDate = class ExamDate extends User {
    url = '/exam_date'
    params = {
        name: "alarm",
        default: "0"
    }
}

User.ExamScore = class ExamScore extends User {
    url = '/exam_score'
    params = {
        name: 'data'
    }
}

// 培养方案
User.CultivateScheme = class CultivateScheme extends User {
    url = '/cultivate_scheme'
    params = [
        {
            name: 'major'
        },
        {
            name: 'department'
        },
        {
            name: 'grade'
        }
    ]
}

// 培养方案列表
User.CultivateSchemeList = class CultivateSchemeList extends User {
    url = '/cultivate_scheme_list'

}

User.EmptyClass = class EmptyClass extends User {
    url = '/empty_class'
    params = [
        {
            name: 'time'
        },
        {
            name: 'week'
        },
        {
            name: 'house'
        },
        {
            name: 'day'
        },

    ]
}

User.Evaluation = class Evaluation extends User {
    url = '/evaluation'
    params = {
        name:'listData'
    }
}

User.EvaluationDetail = class EvaluationDetail extends User {
    url = '/evaluation_detail'
    params = {
        name:'query'
    }

}

User.EvaluationPost = class EvaluationPost extends User {
    url = '/evaluation_post'
    params = {
        name:'query'
    }
}

//四级
User.CET = class CET extends User {
    url = '/cet'
}








































