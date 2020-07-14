import {Util} from "../global/util";

export class User {
  name: string;
  dob: Date;
  gender: string;
  province: string;
  city: string;
  area: string;
  nickname: string;
  imageUrl: string;
  pjToken: string;

  constructor({name, dob, gender, province, city, area, nickname,imageUrl, pjToken}) {
    this.name = name;
    this.dob = new Date(dob);
    this.gender = gender;
    this.province = province;
    this.city = city;
    this.area = area;
    this.nickname = nickname;
    this.imageUrl = imageUrl;
    this.pjToken = pjToken;
  }

  isPersonalInfoIncomplete(): boolean {
    return Util.isEmpty(this.name) ||
      this.dob == null ||
      Util.isEmpty(this.gender) ||
      Util.isEmpty(this.province) ||
      Util.isEmpty(this.city) ||
      Util.isEmpty(this.area) ||
      Util.isEmpty(this.nickname)||
      Util.isEmpty(this.imageUrl)
  }
}
