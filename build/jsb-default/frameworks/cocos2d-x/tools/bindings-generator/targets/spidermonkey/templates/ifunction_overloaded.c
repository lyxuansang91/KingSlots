## ===== instance function implementation template - for overloaded functions
bool ${signature_name}(JSContext *cx, uint32_t argc, JS::Value *vp)
{
    bool ok = true;
    ${namespaced_class_name}* cobj = nullptr;

#if not $is_ctor   
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx);
#end if
#if $is_ctor
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
#end if
#if not $is_constructor
    obj.set(args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(cx, obj);
    cobj = (${namespaced_class_name} *)(proxy ? proxy->ptr : nullptr);
    JSB_PRECONDITION2( cobj, cx, false, "${signature_name} : Invalid Native Object");
#end if
#for func in $implementations
#if len($func.arguments) >= $func.min_args
    #set arg_count = len($func.arguments)
    #set arg_idx = $func.min_args
    #while $arg_idx <= $arg_count
    #set arg_list = ""
    #set arg_array = []
    do {
        ok = true;
        #if $func.min_args >= 0
        if (argc == $arg_idx) {
            #set $count = 0
            #while $count < $arg_idx
                #set $arg = $func.arguments[$count]
                #set $arg_type = arg.to_string($generator)
                #if $arg.is_numeric
            ${arg_type} arg${count} = 0;
                #elif $arg.is_pointer
            ${arg_type} arg${count} = nullptr;
                #else
            ${arg_type} arg${count};
                #end if
            ${arg.to_native({"generator": $generator,
                             "in_value": "args.get(" + str(count) + ")",
                             "out_value": "arg" + str(count),
                             "class_name": $class_name,
                             "level": 3,
                             "ntype": str($arg)})};
                #set $arg_array += ["arg"+str(count)]
                #set $count = $count + 1
            #if $arg_idx > 0 and arg_type != "bool"
            if (!ok) { ok = true; break; }
            #end if
            #end while
            #set $arg_list = ", ".join($arg_array)
        #end if
        #if $is_constructor
            cobj = new (std::nothrow) ${namespaced_class_name}(${arg_list});

            #if not $is_ctor
            JS::RootedObject proto(cx, jsb_${underlined_class_name}_prototype->get());
            obj = JS_NewObjectWithGivenProto(cx, jsb_${underlined_class_name}_class, proto);
            #end if
            #if $is_ref_class
            jsb_ref_init(cx, obj, cobj, "${namespaced_class_name}");
            #else
            jsb_non_ref_init(cx, obj, cobj, "${namespaced_class_name}");
            JS_SetPrivate(obj.get(), cobj);
            #end if
            jsb_new_proxy(cx, cobj, obj);
        #else
            #if str($func.ret_type) != "void"
                #if $func.ret_type.is_enum
            int ret = (int)cobj->${func.func_name}($arg_list);
                #else
            ${func.ret_type.get_whole_name($generator)} ret = cobj->${func.func_name}($arg_list);
                #end if
            JS::RootedValue jsret(cx, JS::NullHandleValue);
            ${func.ret_type.from_native({"generator": $generator,
                                                      "in_value": "ret",
                                                      "out_value": "jsret",
                                                      "ntype": str($func.ret_type),
                                                      "level": 2})};
            JSB_PRECONDITION2(ok, cx, false, "${signature_name} : error parsing return value");
            args.rval().set(jsret);
            #else
            cobj->${func.func_name}($arg_list);
            args.rval().setUndefined();
            #end if
            return true;
        #end if
        }
    } while(0);

    #set $arg_idx = $arg_idx + 1
    #end while
#end if
#end for
#if $is_constructor
    if (cobj)
    {
        JS::RootedValue objVal(cx, JS::ObjectOrNullValue(obj));
        if (JS_HasProperty(cx, obj, "_ctor", &ok) && ok)
        {
            JS::HandleValueArray argsv(args);
            ScriptingCore::getInstance()->executeFunctionWithOwner(objVal, "_ctor", argsv);
        }
        args.rval().set(objVal);
        return true;
    }
#end if
    JS_ReportErrorUTF8(cx, "${signature_name} : arguments error");
    return false;
}
