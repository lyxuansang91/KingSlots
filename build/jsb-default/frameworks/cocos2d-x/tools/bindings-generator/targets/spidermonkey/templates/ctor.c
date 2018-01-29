## ===== ctor function implementation template
static bool ${signature_name}(JSContext *cx, uint32_t argc, JS::Value *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
#if len($arguments) >= $min_args
    #set arg_count = len($arguments)
    #set arg_idx = $min_args
    #set $count = 0
    #if $arg_idx > 0
    bool ok = true;
    #end if
    #while $count < $arg_idx
        #set $arg = $arguments[$count]
        #if $arg.is_numeric
    ${arg.to_string($generator)} arg${count} = 0;
        #elif $arg.is_pointer
    ${arg.to_string($generator)} arg${count} = nullptr;
        #else
    ${arg.to_string($generator)} arg${count};
        #end if
        #set $count = $count + 1
    #end while
    #set $count = 0
    #set arg_list = ""
    #set arg_array = []
    #while $count < $arg_idx
        #set $arg = $arguments[$count]
    ${arg.to_native({"generator": $generator,
                         "in_value": "args.get(" + str(count) + ")",
                         "out_value": "arg" + str(count),
                         "class_name": $class_name,
                         "level": 2,
                         "ntype": str($arg)})};
        #set $arg_array += ["arg"+str(count)]
        #set $count = $count + 1
    #end while
    #if $arg_idx > 0
    JSB_PRECONDITION2(ok, cx, false, "js_${underlined_class_name}_ctor : Error processing arguments");
    #end if
    #set $arg_list = ", ".join($arg_array)
    ${namespaced_class_name} *nobj = new (std::nothrow) ${namespaced_class_name}($arg_list);
#if $is_ref_class
    jsb_ref_init(cx, obj, nobj, "${namespaced_class_name}");
#else
    AddNamedObjectRoot(cx, obj, "${namespaced_class_name}");
#end if
    jsb_new_proxy(cx, nobj, obj);
    bool isFound = false;
    if (JS_HasProperty(cx, obj, "_ctor", &isFound) && isFound)
    {
        JS::HandleValueArray argsv(args);
        JS::RootedValue objVal(cx, JS::ObjectOrNullValue(obj));
        ScriptingCore::getInstance()->executeFunctionWithOwner(objVal, "_ctor", argsv);
    }
    args.rval().setUndefined();
    return true;
#end if
}
