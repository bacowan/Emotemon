using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CrowdControl.Common;
using JetBrains.Annotations;
using System.Web;
using System.Net;
using System.IO;
using System.Reflection; // temp
using Newtonsoft.Json;

namespace CrowdControl.Games.Packs
{
    [UsedImplicitly]
    public class PokemonFireRed : GBAEffectPack
    {
        private const string EmoteUrl = "https://api.twitch.tv/kraken/chat/emoticon_images";

        [NotNull]
        private readonly IPlayer _player;

        private IDictionary<string, string> emoteUrls;

        public PokemonFireRed([NotNull] IPlayer player, [NotNull] Func<CrowdControlBlock, bool> responseHandler, [NotNull] Action<object> statusUpdateHandler) : base(responseHandler, statusUpdateHandler)
        {
            _player = player;

            var webRequest = WebRequest.Create(EmoteUrl);
            var response = webRequest.GetResponse();
            using (var stream = response.GetResponseStream())
            {
                var reader = new StreamReader(stream);
                var responseFromServer = reader.ReadToEnd();
                emoteUrls = JsonConvert.DeserializeObject<AllEmotesResponse>(responseFromServer)
                    .emoticons
                    .GroupBy(r => r.code)
                    .ToDictionary(r => r.Key, r => r.First().id);
                List<SingleEmoteResponse> test;
            }
            response.Close();
        }

        private volatile bool _quitting = false;
        public override void Dispose()
        {
            _quitting = true;
            base.Dispose();
        }

        public override List<Effect> Effects
        {
            get
            {
                return new List<Effect>()
                {
                    new Effect("Test", "test")
                };
            }
        }

        public override List<Common.ItemType> ItemTypes => new List<Common.ItemType>(new[]
        {
            new Common.ItemType("Quantity", "quantity9", Common.ItemType.Subtype.Slider, "{\"min\":1,\"max\":9}")
        });

        public override List<ROMInfo> ROMTable => new List<ROMInfo>(new[]
        {
            new ROMInfo("Pokemon FireRed Version (USA, Europe) (Rev 1)", null, Patching.Ignore, ROMStatus.ValidPatched,s => Patching.MD5(s, "51901A6E40661B3914AA333C802E24E8"))
        });

        public override List<(string, Action)> MenuActions => new List<(string, Action)>();

        public override Game Game { get; } = new Game(27, "PokemonFireRed", "PokemonFireRedGBA", "GBA", ConnectorType.GBAConnector);

        protected override bool IsReady(EffectRequest request) => true;

        protected override void RequestData(DataRequest request) => Respond(request, request.Key, null, false, $"Variable name \"{request.Key}\" not known");

        protected override void StartEffect(EffectRequest request)
        {
            if (!IsReady(request))
            {
                DelayEffect(request, TimeSpan.FromSeconds(5));
                return;
            }



            //var constructors = typeof(Common.ItemType).GetConstructors();
            //foreach (var constructor in constructors)
            //{
            //    foreach (var param in constructor.GetParameters())
            //    {
            //        Connector.SendMessage(param.Name + " " + param.ParameterType);
            //    }
            //    Connector.SendMessage("");
            //}

            //MethodInfo[] methodInfos = typeof(EffectRequest)
            //               .GetMethods(BindingFlags.Public | BindingFlags.Instance);
            //foreach (var info in methodInfos)
            //{
            //    Connector.SendMessage(info.Name);
            //}
            //foreach (var info in Enum.GetNames(typeof(ItemKind)))
            //{
            //    Connector.SendMessage(info);
            //}
            Connector.SendMessage(emoteUrls.First().ToString());

            string[] codeParams = request.FinalCode.Split('_');
            TryEffect(request,
                () => true,
                () => true,
                () => {
                    //Connector.WriteWord(0x4000000, 0xAAAA);
                    Connector.SendMessage("Yay!");
                });

        }

        //private const ushort TEST = 0x08245F50;
        //private const ushort TEST2 = 0xAAFF;

        protected override bool StopEffect(EffectRequest request)
        {
            return true;
        }

        public override bool StopAllEffects() => base.StopAllEffects();
        
        private class AllEmotesResponse
        {
            public List<SingleEmoteResponse> emoticons { get; set; }
        }

        private class SingleEmoteResponse
        {
            public string code { get; set; }
            public string emoticon_set { get; set; }
            public string id { get; set; }
        }
    }
}