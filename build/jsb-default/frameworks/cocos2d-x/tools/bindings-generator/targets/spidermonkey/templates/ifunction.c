## ===== instance function implementation template
bool ${signature_name}(JSContext *cx, uint32_t argc, JS::Value *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
#if len($arguments) > 0 or $ret_type.name != "void"
    bool ok = true; CC_UNUSED_PARAM(ok);
#end if
#if not $is_constructor
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(cx, obj);
    ${namespaced_class_name}* cobj = (${namespaced_class_name} *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "${signature_name} : Invalid Native Object");
#end if
#if len($arguments) >= $min_args
    #set arg_count = len($arguments)
    #set arg_idx = $min_args
    #while $arg_idx <= $arg_count
    if (argc == ${arg_idx}) {
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
        #if $is_constructor
        ${namespaced_class_name}* cobj = new (std::nothrow) ${namespaced_class_name}($arg_list);

        JS::RootedObject jsobj(cx);
        JS::RootedObject proto(cx, jsb_${underlined_class_name}_prototype->get());
        jsb_ref_create_jsobject(cx, cobj, jsb_${underlined_class_name}_class, proto, &jsobj, "${namespaced_class_name}");
        args.rval().set(JS::ObjectOrNullValue(jsobj));
        #else
            #if $ret_type.name != "void"
                #if $ret_type.is_enum
        int ret = (int)cobj->${func_name}($arg_list);
                #else
        ${ret_type.get_whole_name($generator)} ret = cobj->${func_name}($arg_list);
                #end if
        JS::RootedValue jsret(cx);
        ${ret_type.from_native({"generator": $generator,
                                    "in_value": "ret",
                                    "out_value": "jsret",
                                    "ntype": str($ret_type),
                                    "level": 2})};
        JSB_PRECONDITION2(ok, cx, false, "${signature_name} : error parsing return value");
        args.rval().set(jsret);
            #else
        cobj->${func_name}($arg_list);
        args.rval().setUndefined();
            #end if
        #end if
        return true;
    }
        #set $arg_idx = $arg_idx + 1
    #end while
#end if

    JS_ReportErrorUTF8(cx, "${signature_name} : wrong number of arguments: %d, was expecting %d", argc, ${min_args});
    return false;
}
