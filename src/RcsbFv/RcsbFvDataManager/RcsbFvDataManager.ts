export interface RcsbFvDataElementInterface {
    pos?: number;
    val?: number|string;
    start?: number;
    end?: number;
    label?: string;
    color: string;
    description?: string;
}

export class RcsbFvData extends Array<RcsbFvDataElementInterface>{
}

export  class RcsbFvDataArray extends Array<RcsbFvData|string>{
}

export class RcsbFvDataMap extends Map<string,RcsbFvData|string>{
}

export class RcsbFvDataManager {

    public static getNonOverlappingData(data: RcsbFvData): Array<RcsbFvData> {
        const out : Array<RcsbFvData> = new Array<RcsbFvData>();
        data.sort((a,b)=>{
            if(typeof a.start === "number" && typeof b.start === "number") {
                return (a.start-b.start);
            }else if(typeof a.pos === "number" && typeof b.pos === "number"){
                return (a.pos-b.pos);
            }else{
                throw "Unknown data element structure";
            }
        });
        for(const a of data){
            if(typeof a === "string")
                continue;
            let pushed: boolean = false;
            for(const track of out){
                let overlap: boolean = false;
                for(const b of track){
                    if(this.doOverlap(a,b)){
                        overlap = true;
                        break;
                    }
                }
                if(!overlap) {
                    track.push(a);
                    pushed = true;
                    break;
                }
            }
            if(!pushed){
                out.push(new RcsbFvData());
                out[out.length-1].push(a);
            }
        }
        return out;
    }

    private static doOverlap(a: RcsbFvDataElementInterface, b: RcsbFvDataElementInterface): boolean{
        if(typeof a.start === "number" && typeof b.start === "number" && typeof a.end === "number" && typeof b.end === "number") {
                if( a.end <= b.start || b.end <= a.start)
                    return false;
        }else if(typeof a.pos === "number" && typeof b.pos === "number") {
            if(a.pos != b.pos)
                return false;
        }
        return true;
    }

    public static processData(dataTrack: string|RcsbFvData|RcsbFvDataArray): string | RcsbFvData | RcsbFvDataArray {
        if(typeof dataTrack === "string"){
            return dataTrack;
        }else if( dataTrack instanceof Array && dataTrack.length > 0 && (dataTrack[0] instanceof Array || typeof dataTrack[0] === "string")){
            const rcsbFvDataListClass: RcsbFvDataArray = new RcsbFvDataArray();
            for(const dataList of dataTrack){
                if(dataList instanceof Array) {
                    const rcsbFvDataClass: RcsbFvData = new RcsbFvData();
                    for (const dataElement of dataList) {
                        rcsbFvDataClass.push(dataElement);
                    }
                    rcsbFvDataListClass.push(rcsbFvDataClass);
                }else if(typeof dataList === "string"){
                    rcsbFvDataListClass.push(dataList);
                }
            }
            return rcsbFvDataListClass;
        }else if(dataTrack instanceof Array) {
            const rcsbFvDataClass: RcsbFvData = new RcsbFvData();
            for (const dataElement of dataTrack) {
                rcsbFvDataClass.push(dataElement as RcsbFvDataElementInterface);
            }
            return rcsbFvDataClass;
        }else{
            console.error(dataTrack);
            throw "Data format error."
        }
    }
}