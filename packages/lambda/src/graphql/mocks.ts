import { IMocks } from 'apollo-server-lambda';
import casual from 'casual';
import city from '../geographic/city.json';

const cities = Object.values(city)
  .flatMap(x => x)
  .map(({ province, ...x }) => x);

const mocks: IMocks = {
  Tag: () => {
    const tags = [
      '很有想法的',
      '专注设计',
      '辣~',
      '大长腿',
      '川妹子',
      '海纳百川',
    ];
    return { label: tags[casual.integer(0, tags.length)] };
  },
  String: () => 'Deep Dark Fantacy',
  City: () => cities[casual.integer(0, cities.length)],
  Country: () => ({
    id: '156',
    name: '中国',
    alpha2: 'CN',
    alpha3: 'CHN',
  }),
};
export default mocks;
