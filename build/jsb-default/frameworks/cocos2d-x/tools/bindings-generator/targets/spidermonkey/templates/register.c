#set generator = $current_class.generator
#set methods = $current_class.methods_clean()
#set st_methods = $current_class.static_methods_clean()
#set public_fields = $current_class.public_fields
#set has_constructor = False
#set has_ctor = False
#set has_finalize = False
#set has_methods = False
#set has_public_fields = False
#set has_static_methods = False
#if $current_class.methods.has_key('constructor')
#set has_constructor = True
#set constructor = $current_class.methods.constructor
${current_class.methods.constructor.generate_code($current_class)}
#end if
#if $generator.in_listed_extend_classed($current_class.class_name) and $has_constructor
#set has_ctor = True
#end if
#if (not $current_class.is_ref_class and $has_constructor)
#set has_finalize = True
#end if
#if len(methods) > 0 or has_ctor
#set has_methods = True
#end if
#if len($public_fields) > 0
#set has_public_fields = True
#end if
#if len(st_methods) > 0
#set has_static_methods = True
#end if

#if len($current_class.parents) > 0
extern JS::PersistentRootedObject *jsb_${current_class.parents[0].underlined_class_name}_prototype;

#end if
#if has_finalize
void js_${current_class.underlined_class_name}_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (${current_class.class_name})", obj);
    ${current_class.namespaced_class_name} *nobj = static_cast<${current_class.namespaced_class_name} *>(JS_GetPrivate(obj));
    if (nobj) {
        CC_SAFE_DELETE(nobj);
    }
}
#end if
#if has_ctor
#if not $constructor.is_overloaded
    ${constructor.generate_code($current_class, None, False, True)}
#else
    ${constructor.generate_code($current_class, False, True)}
#end if
#end if
void js_register_${generator.prefix}_${current_class.class_name}(JSContext *cx, JS::HandleObject global) {
    static const JSClassOps ${current_class.underlined_class_name}_classOps = {
        nullptr, nullptr, nullptr, nullptr,
        nullptr, nullptr, nullptr,
#if has_finalize
        js_${current_class.underlined_class_name}_finalize,
#else
        nullptr,
#end if
        nullptr, nullptr, nullptr, nullptr
    };
    static JSClass ${current_class.underlined_class_name}_class = {
        "${current_class.target_class_name}",
#if has_finalize
        JSCLASS_HAS_PRIVATE | JSCLASS_FOREGROUND_FINALIZE,
#else
        JSCLASS_HAS_PRIVATE,
#end if
        &${current_class.underlined_class_name}_classOps
    };
    jsb_${current_class.underlined_class_name}_class = &${current_class.underlined_class_name}_class;
#if has_public_fields

    static JSPropertySpec properties[] = {
#for m in public_fields
    #if $generator.should_bind_field($current_class.class_name, m.name)
        JS_PSGS("${m.name}", ${m.signature_name}_get_${m.name}, ${m.signature_name}_set_${m.name}, JSPROP_PERMANENT | JSPROP_ENUMERATE),
    #end if
#end for
        JS_PS_END
    };
#end if
#if has_methods

    static JSFunctionSpec funcs[] = {
        #for m in methods
        #set fn = m['impl']
        JS_FN("${m['name']}", ${fn.signature_name}, ${fn.min_args}, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        #end for
#if has_ctor
        JS_FN("ctor", js_${generator.prefix}_${current_class.class_name}_ctor, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
#end if
        JS_FS_END
    };
#end if
#if has_static_methods

    static JSFunctionSpec st_funcs[] = {
        #for m in st_methods
        #set fn = m['impl']
        JS_FN("${m['name']}", ${fn.signature_name}, ${fn.min_args}, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        #end for
        JS_FS_END
    };
#end if

#if len($current_class.parents) > 0
    JS::RootedObject parent_proto(cx, jsb_${current_class.parents[0].underlined_class_name}_prototype->get());
#else
    JS::RootedObject parent_proto(cx, nullptr);
#end if
    JS::RootedObject proto(cx, JS_InitClass(
        cx, global,
        parent_proto,
        jsb_${current_class.underlined_class_name}_class,
#if has_constructor
        js_${generator.prefix}_${current_class.class_name}_constructor, 0,
#else if $current_class.is_abstract
        empty_constructor, 0,
#else
        dummy_constructor<${current_class.namespaced_class_name}>, 0,
#end if
#if has_public_fields
        properties,
#else
        nullptr,
#end if
#if has_methods
        funcs,
#else
        nullptr,
#end if
        nullptr,
#if has_static_methods
        st_funcs));
#else
        nullptr));
#end if

    // add the proto and JSClass to the type->js info hash table
#if len($current_class.parents) > 0
    js_type_class_t *typeClass = jsb_register_class<${current_class.namespaced_class_name}>(cx, jsb_${current_class.underlined_class_name}_class, proto);
#else
    js_type_class_t *typeClass = jsb_register_class<${current_class.namespaced_class_name}>(cx, jsb_${current_class.underlined_class_name}_class, proto);
#end if
    jsb_${current_class.underlined_class_name}_prototype = typeClass->proto;
    JS::RootedValue className(cx);
    std_string_to_jsval(cx, "${current_class.class_name}", &className);
    JS_SetProperty(cx, proto, "_className", className);
    JS_SetProperty(cx, proto, "__nativeObj", JS::TrueHandleValue);
#if $current_class.is_ref_class
    JS_SetProperty(cx, proto, "__is_ref", JS::TrueHandleValue);
#else
    JS_SetProperty(cx, proto, "__is_ref", JS::FalseHandleValue);
#end if
#if $generator.in_listed_extend_classed($current_class.class_name) and not $current_class.is_abstract
    make_class_extend(cx, proto);
#end if
}

