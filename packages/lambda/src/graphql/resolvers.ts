import { IResolvers } from 'apollo-server-lambda';
import cityData from '../geographic/city.json';
import provinceData from '../geographic/province.json';
import { AuthContext, BasicContext } from './server.js';
import { City } from './types';

const resolvers: IResolvers = {
  Query: {
    me: (source, args, context: BasicContext & AuthContext) => ({
      email: context.auth.email,
      name: context.auth.email.split('@')[0],
      avatar:
        'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
      signature: '海纳百川，有容乃大',
      title: '交互专家',
      group: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
      age: 18,
      address: '西湖区工专路 77 号',
      phone: '0752-268888888',
    }),
  },
  City: {
    province: (city: City, args, ctx: BasicContext) => {
      // tslint:disable-next-line: no-non-null-assertion
      const provinceId = Object.entries(cityData).find(([p, cities]) =>
        cities.some(c => c.id === city.id),
      )![0];
      return provinceData.find(x => x.id === provinceId);
    },
  },
};

export default resolvers;
