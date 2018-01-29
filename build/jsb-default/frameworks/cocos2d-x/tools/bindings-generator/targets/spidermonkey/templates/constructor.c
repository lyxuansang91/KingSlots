## ===== constructor function implementation template
bool ${signature_name}(JSContext *cx, uint32_t argc, JS::Value *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
#if len($arguments) >= $min_args
    #set arg_count = len($arguments)
    #set arg_idx = $min_args
    #set $count = 0
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
    JSB_PRECONDITION2(ok, cx, false, "${signature_name} : Error processing arguments");
    #end if
    #set $arg_list = ", ".join($arg_array)
    ${namespaced_class_name}* cobj = new (std::nothrow) ${namespaced_class_name}($arg_list);

    // create the js object and link the native object with the javascript object
    JS::RootedObject jsobj(cx);
    JS::RootedObject proto(cx, jsb_${underlined_class_name}_prototype->get());
#if $is_ref_class
    jsb_ref_create_jsobject(cx, cobj, jsb_${underlined_class_name}_class, proto, &jsobj, "${namespaced_class_name}");
#else
    jsb_create_weak_jsobject(cx, cobj, jsb_${underlined_class_name}_class, proto, &jsobj, "${namespaced_class_name}");
    JS_SetPrivate(jsobj.get(), cobj);
#end if
    JS::RootedValue retVal(cx, JS::ObjectOrNullValue(jsobj));
    args.rval().set(retVal);
    if (JS_HasProperty(cx, jsobj, "_ctor", &ok) && ok) 
    {
        JS::HandleValueArray argsv(args);
        ScriptingCore::getInstance()->executeFunctionWithOwner(retVal, "_ctor", argsv);
    }
    return true;
#end if
}
