class ProgramListGetter {
    constructor(requestM){
        this.$ = require('jquery');
        window.moment = require('moment');
        this.ymd = requestM.format('YYYYMMDD');
        this.URL = null;
    }

    setStationUrl(stationId){
        this.URL = 'http://radiko.jp/v3/program/station/weekly/'+ stationId + '.xml';
        return this;
    }

    setAreaUrl(areaId){
        this.URL = 'http://radiko.jp/v3/program/date/'+ this.ymd +'/'+ areaId + '.xml';
        return this;
    }

    request(){
        return new Promise((resolve, reject) => {
            this.$.ajax({
                url: this.URL
            }).done((data, textStatus, jqXHR) => {
                resolve(data);
            }).fail((jqXHR, textStatus, errorThrown) => {
                console.log('fail', jqXHR.status, textStatus);
                reject(errorThrown);
            });
        });
    }
}

class EreaChecker {
    constructor(){
        this.URL = 'http://radiko.jp/area';
        this.$ = require('jquery');
    }

    check(){
        return new Promise((resolve, reject) => {
            this.$.ajax({
                url: this.URL,
                cache: false
            }).done((data, textStatus, jqXHR) => {
                try {
                    const html = this.$(data.split("'")[1]);
                    const area = html.attr('class');
                    console.log(html, area);
                    EreaChecker.setAreaIdToStorage(area);
                    resolve(area);
                } catch (e) {
                    reject(e);
                }
            }).fail((jqXHR, textStatus, errorThrown) => {
                console.log('fail', jqXHR.status, textStatus);
                reject(errorThrown);
            });
        });
    }

    static getAreaIdFromStorage(){
        return localStorage.getItem('areaId');
    }

    static setAreaIdToStorage(areaId){
        localStorage.setItem('areaId', areaId);
    }
}

module.exports = {
    ProgramListGetter: ProgramListGetter,
    EreaChecker: EreaChecker
};