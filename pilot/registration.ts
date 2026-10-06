// The grading check's fixed inputs (docs/GRADING_PROTOCOL.md §9), recorded before any chatbot reply was
// saved. `npm run pilot:score` and `npm run pilot:prompt` refuse to run when the answer set or a key
// no longer matches. Changing a value here changes the check's gold or keys after the fact and needs
// a docs/DECISIONS.md entry; held-out results influenced by such a change are regression material.

export interface Registration {
  /** goldDigest (pilot/load.ts): Claude's scores, fixed before the blind second scorer started. */
  gold: string;
  /** labelDigest (pilot/load.ts): the final labels after second scoring and settlement. */
  labels: string;
  /** Snapshot hash of every task in the answer set, under which its answers were scored. */
  tasks: Readonly<Record<string, string>>;
}

export const REGISTRATION: Registration = {
  // Pre-registered at about 20:25 UTC on 2026-10-06 (/mnt/project-files/grading-check/README.md).
  gold: 'ae78dd71f7ef4b8824d9919aba1fcc4b2e0f1de6a5f551b5db0db87744aeb59f',
  // At 7094d21: both scorers' scores and seven acceptable-score sets, all on development exercises.
  labels: '808927cf4b80c3b1cebafd72409596a5f09cf45be900b431929537ee96d76c4b',
  // Keys at main 72888ad.
  tasks: {
    'arg-0009.flaw': '99089536385814080f5e0a6d9f3d251766ffcfd5c2a104120dfb80bd6cd649a5',
    'arg-0009.strengthen': 'c4e2f22e01051fd00f4d594415863cbffa3d057ffbab2b1c76cd2565b789d696',
    'arg-0010.assumption': '855af9b8f30409549fc0f33b47076693014f6b62bf061fe789ddaee89bcc12b2',
    'arg-0011.flaw': 'c27186b0b32050ef2ed66267e92491b495fdb3cebbd513f3d46eaeaf75653662',
    'arg-0012.strengthen': 'dfea401269e5c12430a40dec1356f060ce1775ab06d8a3bb9d7dc2345633b6c9',
    'arg-0012.weaken': '00e7718a795953cc21294b2bd6918f370ea9905d2473b15f03b794468a613b08',
    'arg-0013.assumption': '94f0bdbc60efe40cd0565f1d244063da348358c55b6dcf537bbe27e2a78bb55c',
    'arg-0013.conclusion': '837020b094efbf9c46f24efe2af1c0481bea3118fbebf395c43c7f33dfd33593',
    'arg-0014.flaw': '36296f9521eec33093f3ecda7bdb75c11597725022bf33ec4409c3c8de1bf63c',
    'arg-0014.weaken': '77f5b9f14cbed520161efbebe6390832360aa78008339acceb1274aa1eaa3636',
    'arg-0015.assumption': '88c1ac972a38cbd97e4e94ec89e8196b18185ab034c22c4a4464b7b61ca161db',
    'arg-0015.strengthen': 'bd4b45d1c7b55e2d69d5f8d83f40b25d9ffc78a5cae38ee80bc717eb717e7496',
    'arg-0016.weaken': '33dd30bd51484d7593275ab76ec88de51a6af414a43adc2f0682a90c6f576d89',
    'arg-0017.conclusion': 'd329e18d41fb8f8fe4e4a00941e9230388300b6eddbeb14f5275fa1bba5250e7',
    'arg-0019.assumption': 'cc89fe651806fcfd5f93965c013ac369a577eb54aafc55c16c28b1d793c9728d',
    'arg-0020.flaw': '14527d8e350cc40c01833387421f6f32ba61f7f9b784b82da1cc70eaacc525d1',
    'arg-0020.weaken': '429a6fce8fbec4bed3b3686bbbe2a563881a42cf481795460c34643ebe4b188e',
    'arg-0021.flaw': 'ec841b58e2a745d8cc3f643f981ea47b57ac40989e2ccc25a16f0df8d99439de',
    'arg-0022.strengthen': '0bec2ed71823e6bf39b0b7c7ef93d08fe167894fd93d1b9419acf59aae3d237e',
    'arg-0023.assumption': '11ee666fa05b933dabb57e11cf05585c4b249a47905d62d898693769076d2a35',
    'arg-0024.assumption': '171cfbdd8623334eeeb19ac30611bfcc9869bbc94d8990d2c5ae679cbf0e203e',
    'arg-0024.conclusion': '28724fcca95f57247818dd0ccba2b39264faabf11b3e2e1ac09516b27af9f98f',
    'arg-0025.flaw': '360bdc48b2eda1e8e624434e61911d327ff82e4d3c7334bbf5b006d3512394c2',
    'arg-0025.weaken': '4f7c64ed97b81d5634f5a0941a1e3c054bbfd1839bc5847caff4ae9ca60424e9',
    'arg-0026.strengthen': '66ac558852bdbb84f94276160fe20732fdfa69d07be6cf0278c54c7d8920084e',
    'arg-0027.assumption': '6dc447a7d8bac114e064e5211de1d483274ce1c47ea3554c77e50abb441ec1c7',
    'arg-0027.strengthen': '198269e7d33a4153198a796b6acc7a50fc4f111d2a4178ba99c7ab9d10cb0fe1',
    'arg-0028.weaken': '2d88e386587d83e88a80d98c0b440d313024ef3bcb0adff521f4678ccd7f62ec',
  },
};
