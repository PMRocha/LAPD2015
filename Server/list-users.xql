xquery version "3.0";

declare namespace json="http://www.json.org";

declare variable $collection external;

declare option exist:serialize "method=json media-type=application/json";


for $user in doc("schema.xml")/Finance/Users/User
return $user
