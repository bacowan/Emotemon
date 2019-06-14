using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CrowdControl.Common;
using JetBrains.Annotations;
using System.Reflection; // temp

namespace CrowdControl.Games.Packs
{
	[UsedImplicitly]
	public class PokemonFireRed : GBAEffectPack
    {
        [NotNull]
        private readonly IPlayer _player;

        public PokemonFireRed([NotNull] IPlayer player, [NotNull] Func<CrowdControlBlock, bool> responseHandler, [NotNull] Action<object> statusUpdateHandler) : base(responseHandler, statusUpdateHandler) => _player = player;

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

            MethodInfo[] methodInfos = Connector.GetType()
                           .GetMethods(BindingFlags.Public | BindingFlags.Instance);
            foreach (var info in methodInfos)
            {
                Connector.SendMessage(info.Name);
            }

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

    }
}