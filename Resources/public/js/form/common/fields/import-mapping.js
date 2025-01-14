'use strict';

define([
        'jquery',
        'underscore',
        'oro/translator',
        'tabulator',
        'pim/fetcher-registry',
        'pim/form/common/fields/field',
        'pim/template/form/common/fields/import-mapping'
    ],
    function (
        $,
        _,
        __,
        Tabulator,
        FetcherRegistry,
        BaseField,
        template
    ) {
        return BaseField.extend({
            template: _.template(template),

            yesNoValues: {
                'true': __('pim_common.yes'),
                'false': __('pim_common.no'),
            },

            luaUpdaters: {},

            /**
             * {@inheritdoc}
             */
            renderInput: function (templateContext) {
                return this.template(_.extend(templateContext, {
                    value: this.getModelValue()
                }));
            },

            /**
             * {@inherit}
             */
            configure() {
                return $.when(
                    this.fetchLuaUpdaters().then(luaUpdaters => {
                        var self = this;
                        _.each(luaUpdaters, function (luaUpdater) {
                            self.luaUpdaters[luaUpdater.code] = luaUpdater.label;
                        });
                    }),
                );
            },

            /**
             * {@inheritdoc}
             */
            postRender: function () {
                var self = this;
                var modelValueAsString = !_.isUndefined(self.getModelValue()) ? self.getModelValue() : '[]';
                var tabledata = JSON.parse(modelValueAsString);
                var table = new Tabulator("#mapping-table", {
                    data: tabledata,
                    layout: "fitColumns",
                    responsiveLayout: true,
                    columnHeaderSortMulti: false,
                    addRowPos: 'bottom',
                    cellEdited: function (cell) {
                        self.updateModelValue(cell._cell.table.getData());
                    },
                    rowDeleted: function (row) {
                        self.updateModelValue(row._row.table.getData());
                    },
                    columns: [
                        {
                            title: __('candm_advanced_csv_connector.importMapping.columns.attribute_code'),
                            field: 'attributeCode',
                            headerSort: false,
                            editor: 'input'
                        },
                        {
                            title: __('candm_advanced_csv_connector.importMapping.columns.column_name'),
                            field: 'dataCode',
                            headerSort: false,
                            editor: 'input'
                        },
                        {
                            title: __('candm_advanced_csv_connector.importMapping.columns.lua_updater'),
                            field: 'luaUpdater',
                            headerSort: false,
                            editor: 'autocomplete',
                            editorParams: {
                                allowEmpty: true,
                                values: self.luaUpdaters
                            }
                        },
                        {
                            title: __('candm_advanced_csv_connector.importMapping.columns.default_value'),
                            field: 'defaultValue',
                            headerSort: false,
                            editor: 'input'
                        },
                        {
                            title: __('candm_advanced_csv_connector.importMapping.columns.identifier'),
                            field: 'identifier',
                            headerSort: false,
                            editor: 'select',
                            editorParams: {
                                values: self.yesNoValues
                            },
                            accessorData: self.booleanAccessor,
                            formatter: self.booleanFormatter,
                            formatterParams: {self: self}
                        },
                        {
                            title: __('candm_advanced_csv_connector.importMapping.columns.only_on_creation'),
                            field: 'onlyOnCreation',
                            headerSort: false,
                            editor: 'select',
                            editorParams: {
                                values: self.yesNoValues
                            },
                            accessorData: self.booleanAccessor,
                            formatter: self.booleanFormatter,
                            formatterParams: {self: self}
                        },
                        {
                            title: __('candm_advanced_csv_connector.importMapping.columns.delete_if_null'),
                            field: 'deleteIfNull',
                            headerSort: false,
                            editor: 'select',
                            editorParams: {
                                values: self.yesNoValues
                            },
                            accessorData: self.booleanAccessor,
                            formatter: self.booleanFormatter,
                            formatterParams: {self: self}
                        },
                        {
                            title: __('candm_advanced_csv_connector.importMapping.actions.delete_row'),
                            field: 'delete',
                            formatter: 'tickCross',
                            headerSort: false,
                            cellClick: function (e, cell) {
                                cell._cell.row.delete();
                            },
                        }
                    ]
                });

                // Manage clicks
                $("#add-row").click(function () {
                    table.addRow({});
                });
            },

            /**
             * Accessor data used to convert string value to boolean
             *
             * @param value
             * @param data
             * @param type
             * @param params
             * @param column
             */
            booleanAccessor: function (value, data, type, params, column) {
                return value === 'true';
            },

            /**
             * Boolean formatter
             *
             * @param cell
             * @param formaterParams
             * @param onRendered
             */
            booleanFormatter: function (cell, formaterParams, onRendered) {
                return _.has(formaterParams.self.yesNoValues, cell.getValue()) ? formaterParams.self.yesNoValues[cell.getValue()] : __('pim_common.no');
            },

            /**
             * Update model data
             *
             * @param data
             */
            updateModelValue: function (data) {
                var dataAsString = JSON.stringify(data);
                this.updateModel(dataAsString);
            },

            /**
             * Get LUA scripts
             *
             * @returns {*|Promise}
             */
            fetchLuaUpdaters() {
                const fetcher = FetcherRegistry.getFetcher('custom_entity');

                return fetcher.fetchAllByType('luaUpdater');
            },
        });
    });