// import { expect } from 'chai';

// import * as RemoteData from '../../remote_data';
// import { defaultPolicy, itemsPassPolicy, loadedPolicy, sameResource } from './';

// describe('itemsPassPolicy', () => {

//   let testNotLoadedData, testLoadedData, testReloadingData, testErrorData, testLoadingData;

//   beforeEach(() => {
//     testNotLoadedData = RemoteData.notLoaded();
//     testLoadedData = RemoteData.loaded({});
//     testLoadingData = RemoteData.loaded({});
//     testReloadingData = RemoteData.reloading(testLoadedData);
//     testErrorData = RemoteData.errored('err');
//   });

//   describe(' with a loadedPolicy', () => {

//     it('should return testLoadingData when given loaded data', () => {
//       expect(itemsPassPolicy(loadedPolicy, { testLoadedData })).to.deep.equal(true);
//     });

//     it('should return false when given reloading data', () => {
//       expect(itemsPassPolicy(loadedPolicy, { testReloadingData })).to.deep.equal(false);
//     });

//     it('should return false when given loaded, and reloading, notLoading data', () => {
//       expect(itemsPassPolicy(loadedPolicy, { testLoadedData, testReloadingData, testNotLoadedData }))
//         .to.deep.equal(false);
//     });

//     it('should return false when given loaded, and error, loading data', () => {
//       expect(itemsPassPolicy(loadedPolicy, { testLoadedData, testErrorData, testLoadingData }))
//         .to.deep.equal(false);
//     });
//   });

//   describe(' with a defaultPolicy', () => {

//     it('should return testLoadingData when given loaded data', () => {
//       expect(itemsPassPolicy(defaultPolicy, { testLoadedData })).to.deep.equal(true);
//     });

//     it('should return true when given reloading data', () => {
//       expect(itemsPassPolicy(defaultPolicy, { testReloadingData })).to.deep.equal(true);
//     });

//     it('should return false when given loaded, and reloading, notLoading data', () => {
//       expect(itemsPassPolicy(defaultPolicy, { testLoadedData, testReloadingData, testNotLoadedData }))
//         .to.deep.equal(false);
//     });

//     it('should return false when given loaded, and error, loading data', () => {
//       expect(itemsPassPolicy(defaultPolicy, { testLoadedData, testErrorData, testLoadingData }))
//         .to.deep.equal(false);
//     });
//   });
// });

// describe('sameResource', () => {

//   it('should return false when given id and unloaded resource', () => {
//     expect(sameResource(RemoteData.notLoaded(), 'foo')).to.deep.equal(false);
//   });

//   it('should return false when given id and loaded resource with a different furled id', () => {
//     expect(sameResource(RemoteData.loaded({
//       _links: {
//         self: {
//           href: '/foo',
//         }
//       }
//     }), '')).to.deep.equal(false);
//   });

//   it('should return true when given id and loaded resource with a same furled id', () => {
//     expect(sameResource(RemoteData.loaded({
//       _links: {
//         self: {
//           href: '/foo',
//         }
//       }
//     }), 'Bpyy')).to.deep.equal(true);
//   });

// });
