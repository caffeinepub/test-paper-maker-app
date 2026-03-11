import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import Map "mo:core/Map";
import Text "mo:core/Text";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Data structure for storing paper data
  let paperDataMap = Map.empty<Text, Text>();

  public shared ({ caller }) func savePaper(id : Text, data : Text) : async () {
    paperDataMap.add(id, data);
  };

  public query ({ caller }) func getPaper(id : Text) : async ?Text {
    paperDataMap.get(id);
  };
};
