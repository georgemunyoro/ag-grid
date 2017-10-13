import {Utils as _} from "../utils";
import {ColumnGroup} from "../entities/columnGroup";
import {Column} from "../entities/column";
import {AbstractColDef, ColDef, ColGroupDef, IAggFunc} from "../entities/colDef";
import {ColumnGroupChild} from "../entities/columnGroupChild";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ExpressionService} from "../valueService/expressionService";
import {BalancedColumnTreeBuilder} from "./balancedColumnTreeBuilder";
import {DisplayedGroupCreator} from "./displayedGroupCreator";
import {AutoWidthCalculator} from "../rendering/autoWidthCalculator";
import {OriginalColumnGroupChild} from "../entities/originalColumnGroupChild";
import {EventService} from "../eventService";
import {ColumnUtils} from "./columnUtils";
import {Logger, LoggerFactory} from "../logger";
import {
    ColumnEvent,
    ColumnEverythingChangedEvent,
    ColumnGroupOpenedEvent,
    ColumnMovedEvent,
    ColumnPinnedEvent,
    ColumnPivotModeChangedEvent,
    ColumnResizedEvent,
    ColumnRowGroupChangedEvent,
    ColumnValueChangedEvent,
    ColumnVisibleEvent,
    DisplayedColumnsChangedEvent,
    DisplayedColumnsWidthChangedEvent,
    Events,
    GridColumnsChangedEvent,
    NewColumnsLoadedEvent,
    VirtualColumnsChangedEvent
} from "../events";
import {OriginalColumnGroup} from "../entities/originalColumnGroup";
import {GroupInstanceIdCreator} from "./groupInstanceIdCreator";
import {Autowired, Bean, Context, Optional, PostConstruct, Qualifier} from "../context/context";
import {GridPanel} from "../gridPanel/gridPanel";
import {IAggFuncService} from "../interfaces/iAggFuncService";
import {ColumnAnimationService} from "../rendering/columnAnimationService";
import {AutoGroupColService} from "./autoGroupColService";
import {RowNode} from "../entities/rowNode";
import {ValueCache} from "../valueService/valueCache";
import {GridApi} from "../gridApi";

@Bean('columnApi')
export class ColumnApi {

    @Autowired('columnController') private _columnController: ColumnController;

    public sizeColumnsToFit(gridWidth: any): void { this._columnController.sizeColumnsToFit(gridWidth); }
    public setColumnGroupOpened(group: OriginalColumnGroup|string, newValue: boolean): void { this._columnController.setColumnGroupOpened(group, newValue); }
    public getColumnGroup(name: string, instanceId?: number): ColumnGroup { return this._columnController.getColumnGroup(name, instanceId); }
    public getOriginalColumnGroup(name: string): OriginalColumnGroup { return this._columnController.getOriginalColumnGroup(name); }

    public getDisplayNameForColumn(column: Column, location: string): string { return this._columnController.getDisplayNameForColumn(column, location); }
    public getDisplayNameForColumnGroup(columnGroup: ColumnGroup, location: string): string { return this._columnController.getDisplayNameForColumnGroup(columnGroup, location); }

    public getColumn(key: any): Column { return this._columnController.getPrimaryColumn(key); }
    public setColumnState(columnState: any): boolean { return this._columnController.setColumnState(columnState); }
    public getColumnState(): any[] { return this._columnController.getColumnState(); }
    public resetColumnState(): void { this._columnController.resetColumnState(); }
    public getColumnGroupState(): {groupId: string, open: boolean}[] {return this._columnController.getColumnGroupState()}
    public setColumnGroupState(stateItems: ({groupId: string, open: boolean})[]): void {this._columnController.setColumnGroupState(stateItems)}
    public resetColumnGroupState(): void { this._columnController.resetColumnGroupState(); }

    public isPinning(): boolean { return this._columnController.isPinningLeft() || this._columnController.isPinningRight(); }
    public isPinningLeft(): boolean { return this._columnController.isPinningLeft(); }
    public isPinningRight(): boolean { return this._columnController.isPinningRight(); }
    public getDisplayedColAfter(col: Column): Column { return this._columnController.getDisplayedColAfter(col); }
    public getDisplayedColBefore(col: Column): Column { return this._columnController.getDisplayedColBefore(col); }
    public setColumnVisible(key: string|Column, visible: boolean): void { this._columnController.setColumnVisible(key, visible); }
    public setColumnsVisible(keys: (string|Column)[], visible: boolean): void { this._columnController.setColumnsVisible(keys, visible); }
    public setColumnPinned(key: string|Column, pinned: string): void { this._columnController.setColumnPinned(key, pinned); }
    public setColumnsPinned(keys: (string|Column)[], pinned: string): void { this._columnController.setColumnsPinned(keys, pinned); }

    public getAllColumns(): Column[] { return this._columnController.getAllPrimaryColumns(); }
    public getAllGridColumns(): Column[] { return this._columnController.getAllGridColumns(); }
    public getDisplayedLeftColumns(): Column[] { return this._columnController.getDisplayedLeftColumns(); }
    public getDisplayedCenterColumns(): Column[] { return this._columnController.getDisplayedCenterColumns(); }
    public getDisplayedRightColumns(): Column[] { return this._columnController.getDisplayedRightColumns(); }
    public getAllDisplayedColumns(): Column[] { return this._columnController.getAllDisplayedColumns(); }
    public getAllDisplayedVirtualColumns(): Column[] { return this._columnController.getAllDisplayedVirtualColumns(); }

    public moveColumn(key: string|Column, toIndex: number): void {
        if (typeof key === 'number') {
            // moveColumn used to take indexes, so this is advising user who hasn't moved to new method name
            console.log('ag-Grid: you are using moveColumn(fromIndex, toIndex) - moveColumn takes a column key and a destination index, not two indexes, to move with indexes use moveColumnByIndex(from,to) instead');
            this._columnController.moveColumnByIndex(<number>key, toIndex);
        } else {
            this._columnController.moveColumn(key, toIndex);
        }
    }
    public moveColumnByIndex(fromIndex: number, toIndex: number): void { this._columnController.moveColumnByIndex(fromIndex, toIndex); }
    public moveColumns(columnsToMoveKeys: (string|Column)[], toIndex: number) { this._columnController.moveColumns(columnsToMoveKeys, toIndex); }

    public moveRowGroupColumn(fromIndex: number, toIndex: number): void { this._columnController.moveRowGroupColumn(fromIndex, toIndex); }
    public setColumnAggFunc(column: Column, aggFunc: string): void { this._columnController.setColumnAggFunc(column, aggFunc); }
    public setColumnWidth(key: string|Column, newWidth: number, finished: boolean = true): void { this._columnController.setColumnWidth(key, newWidth, finished); }
    public setPivotMode(pivotMode: boolean): void { this._columnController.setPivotMode(pivotMode); }
    public isPivotMode(): boolean { return this._columnController.isPivotMode(); }
    public getSecondaryPivotColumn(pivotKeys: string[], valueColKey: string|Column): Column { return this._columnController.getSecondaryPivotColumn(pivotKeys, valueColKey); }

    public setValueColumns(colKeys: (string|Column)[]): void { this._columnController.setValueColumns(colKeys); }
    public getValueColumns(): Column[] { return this._columnController.getValueColumns(); }
    public removeValueColumn(colKey: (string|Column)): void { this._columnController.removeValueColumn(colKey); }
    public removeValueColumns(colKeys: (string|Column)[]): void { this._columnController.removeValueColumns(colKeys); }
    public addValueColumn(colKey: (string|Column)): void { this._columnController.addValueColumn(colKey); }
    public addValueColumns(colKeys: (string|Column)[]): void { this._columnController.addValueColumns(colKeys); }

    public setRowGroupColumns(colKeys: (string|Column)[]): void { this._columnController.setRowGroupColumns(colKeys); }
    public removeRowGroupColumn(colKey: string|Column): void { this._columnController.removeRowGroupColumn(colKey); }
    public removeRowGroupColumns(colKeys: (string|Column)[]): void { this._columnController.removeRowGroupColumns(colKeys); }
    public addRowGroupColumn(colKey: string|Column): void { this._columnController.addRowGroupColumn(colKey); }
    public addRowGroupColumns(colKeys: (string|Column)[]): void { this._columnController.addRowGroupColumns(colKeys); }
    public getRowGroupColumns(): Column[] { return this._columnController.getRowGroupColumns(); }

    public setPivotColumns(colKeys: (string|Column)[]): void { this._columnController.setPivotColumns(colKeys); }
    public removePivotColumn(colKey: string|Column): void { this._columnController.removePivotColumn(colKey); }
    public removePivotColumns(colKeys: (string|Column)[]): void { this._columnController.removePivotColumns(colKeys); }
    public addPivotColumn(colKey: string|Column): void { this._columnController.addPivotColumn(colKey); }
    public addPivotColumns(colKeys: (string|Column)[]): void { this._columnController.addPivotColumns(colKeys); }
    public getPivotColumns(): Column[] { return this._columnController.getPivotColumns(); }

    public getLeftDisplayedColumnGroups(): ColumnGroupChild[] { return this._columnController.getLeftDisplayedColumnGroups(); }
    public getCenterDisplayedColumnGroups(): ColumnGroupChild[] { return this._columnController.getCenterDisplayedColumnGroups(); }
    public getRightDisplayedColumnGroups(): ColumnGroupChild[] { return this._columnController.getRightDisplayedColumnGroups(); }
    public getAllDisplayedColumnGroups(): ColumnGroupChild[] { return this._columnController.getAllDisplayedColumnGroups(); }
    public autoSizeColumn(key: string|Column): void {return this._columnController.autoSizeColumn(key); }
    public autoSizeColumns(keys: (string|Column)[]): void {return this._columnController.autoSizeColumns(keys); }
    public autoSizeAllColumns(): void { this._columnController.autoSizeAllColumns(); }

    public setSecondaryColumns(colDefs: (ColDef|ColGroupDef)[]): void { this._columnController.setSecondaryColumns(colDefs); }

    // below goes through deprecated items, prints message to user, then calls the new version of the same method

    public columnGroupOpened(group: OriginalColumnGroup|string, newValue: boolean): void {
        console.error('ag-Grid: columnGroupOpened no longer exists, use setColumnGroupOpened');
        this.setColumnGroupOpened(group, newValue);
    }
    public hideColumns(colIds: any, hide: any): void {
        console.error('ag-Grid: hideColumns is deprecated, use setColumnsVisible');
        this._columnController.setColumnsVisible(colIds, !hide);
    }
    public hideColumn(colId: any, hide: any): void {
        console.error('ag-Grid: hideColumn is deprecated, use setColumnVisible');
        this._columnController.setColumnVisible(colId, !hide);
    }

    public setState(columnState: any): boolean {
        console.error('ag-Grid: setState is deprecated, use setColumnState');
        return this.setColumnState(columnState);
    }
    public getState(): any[] {
        console.error('ag-Grid: getState is deprecated, use getColumnState');
        return this.getColumnState();
    }
    public resetState(): void {
        console.error('ag-Grid: resetState is deprecated, use resetColumnState');
        this.resetColumnState();
    }

    public getAggregationColumns(): Column[] {
        console.error('ag-Grid: getAggregationColumns is deprecated, use getValueColumns');
        return this._columnController.getValueColumns();
    }

    public removeAggregationColumn(colKey: (string|Column)): void {
        console.error('ag-Grid: removeAggregationColumn is deprecated, use removeValueColumn');
        this._columnController.removeValueColumn(colKey);
    }

    public removeAggregationColumns(colKeys: (string|Column)[]): void {
        console.error('ag-Grid: removeAggregationColumns is deprecated, use removeValueColumns');
        this._columnController.removeValueColumns(colKeys);
    }

    public addAggregationColumn(colKey: (string|Column)): void {
        console.error('ag-Grid: addAggregationColumn is deprecated, use addValueColumn');
        this._columnController.addValueColumn(colKey);
    }

    public addAggregationColumns(colKeys: (string|Column)[]): void {
        console.error('ag-Grid: addAggregationColumns is deprecated, use addValueColumns');
        this._columnController.addValueColumns(colKeys);
    }

    public setColumnAggFunction(column: Column, aggFunc: string): void {
        console.error('ag-Grid: setColumnAggFunction is deprecated, use setColumnAggFunc');
        this._columnController.setColumnAggFunc(column, aggFunc);
    }

    public getDisplayNameForCol(column: any): string {
        console.error('ag-Grid: getDisplayNameForCol is deprecated, use getDisplayNameForColumn');
        return this.getDisplayNameForColumn(column, null);
    }
}

@Bean('columnController')
export class ColumnController {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('expressionService') private expressionService: ExpressionService;
    @Autowired('balancedColumnTreeBuilder') private balancedColumnTreeBuilder: BalancedColumnTreeBuilder;
    @Autowired('displayedGroupCreator') private displayedGroupCreator: DisplayedGroupCreator;
    @Autowired('autoWidthCalculator') private autoWidthCalculator: AutoWidthCalculator;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnUtils') private columnUtils: ColumnUtils;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('context') private context: Context;
    @Autowired('columnAnimationService') private columnAnimationService: ColumnAnimationService;
    @Autowired('autoGroupColService') private autoGroupColService: AutoGroupColService;
    @Optional('aggFuncService') private aggFuncService: IAggFuncService;
    @Optional('valueCache') private valueCache: ValueCache;

    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    // these are the columns provided by the client. this doesn't change, even if the
    // order or state of the columns and groups change. it will only change if the client
    // provides a new set of column definitions. otherwise this tree is used to build up
    // the groups for displaying.
    private primaryBalancedTree: OriginalColumnGroupChild[];
    // header row count, based on user provided columns
    private primaryHeaderRowCount = 0;
    // all columns provided by the user. basically it's the leaf level nodes of the
    // tree above (originalBalancedTree)
    private primaryColumns: Column[]; // every column available

    // if pivoting, these are the generated columns as a result of the pivot
    private secondaryBalancedTree: OriginalColumnGroupChild[];
    private secondaryColumns: Column[];
    private secondaryHeaderRowCount = 0;
    private secondaryColumnsPresent = false;

    // these are all columns that are available to the grid for rendering after pivot
    private gridBalancedTree: OriginalColumnGroupChild[];
    private gridColumns: Column[];
    // header row count, either above, or based on pivoting if we are pivoting
    private gridHeaderRowCount = 0;

    // these are the columns actually shown on the screen. used by the header renderer,
    // as header needs to know about column groups and the tree structure.
    private displayedLeftColumnTree: ColumnGroupChild[];
    private displayedRightColumnTree: ColumnGroupChild[];
    private displayedCentreColumnTree: ColumnGroupChild[];

    private displayedLeftHeaderRows: {[row: number]: ColumnGroupChild[]};
    private displayedRightHeaderRows: {[row: number]: ColumnGroupChild[]};
    private displayedCentreHeaderRows: {[row: number]: ColumnGroupChild[]};

    // these are the lists used by the rowRenderer to render nodes. almost the leaf nodes of the above
    // displayed trees, however it also takes into account if the groups are open or not.
    private displayedLeftColumns: Column[] = [];
    private displayedRightColumns: Column[] = [];
    private displayedCenterColumns: Column[] = [];
    // all three lists above combined
    private allDisplayedColumns: Column[] = [];
    // same as above, except trimmed down to only columns within the viewport
    private allDisplayedVirtualColumns: Column[] = [];
    private allDisplayedCenterVirtualColumns: Column[] = [];

    private colSpanActive: boolean;

    private rowGroupColumns: Column[] = [];
    private valueColumns: Column[] = [];
    private pivotColumns: Column[] = [];

    private groupAutoColumns: Column[];

    private groupDisplayColumns: Column[];

    private ready = false;
    private logger: Logger;

    private autoGroupsNeedBuilding = false;

    private pivotMode = false;

    // for horizontal visualisation of columns
    private scrollWidth: number;
    private scrollPosition: number;

    private bodyWidth = 0;
    private leftWidth = 0;
    private rightWidth = 0;

    private bodyWidthDirty = true;

    private viewportLeft: number;
    private viewportRight: number;

    @PostConstruct
    public init(): void {
        if (this.checkPivotAllowed()) {
            this.pivotMode = this.gridOptionsWrapper.isPivotMode();
        }
    }

    private setVirtualViewportLeftAndRight(): void {
        if (this.gridOptionsWrapper.isEnableRtl()) {
            this.viewportLeft = this.bodyWidth - this.scrollPosition - this.scrollWidth;
            this.viewportRight = this.bodyWidth - this.scrollPosition;
        } else {
            this.viewportLeft = this.scrollPosition;
            this.viewportRight = this.scrollWidth + this.scrollPosition;
        }
    }

    // used by clipboard service, to know what columns to paste into
    public getDisplayedColumnsStartingAt(column: Column): Column[] {
        let currentColumn = column;
        let result: Column[] = [];
        while (_.exists(currentColumn)) {
            result.push(currentColumn);
            currentColumn = this.getDisplayedColAfter(currentColumn);
        }
        return result;
    }

    // checks what columns are currently displayed due to column virtualisation. fires an event
    // if the list of columns has changed.
    // + setColumnWidth(), setVirtualViewportPosition(), setColumnDefs(), sizeColumnsToFit()
    private checkDisplayedVirtualColumns(): void {
        // check displayCenterColumnTree exists first, as it won't exist when grid is initialising
        if (_.exists(this.displayedCenterColumns)) {
            let hashBefore = this.allDisplayedVirtualColumns.map( column => column.getId() ).join('#');
            this.updateVirtualSets();
            let hashAfter = this.allDisplayedVirtualColumns.map( column => column.getId() ).join('#');
            if (hashBefore !== hashAfter) {
                let event: VirtualColumnsChangedEvent = {
                    type: Events.EVENT_VIRTUAL_COLUMNS_CHANGED,
                    api: this.gridApi,
                    columnApi: this.columnApi
                };
                this.eventService.dispatchEvent(event);
            }
        }
    }

    public setVirtualViewportPosition(scrollWidth: number, scrollPosition: number): void {
        if (scrollWidth!==this.scrollWidth || scrollPosition!==this.scrollPosition || this.bodyWidthDirty) {
            this.scrollWidth = scrollWidth;
            this.scrollPosition = scrollPosition;
            // we need to call setVirtualViewportLeftAndRight() at least once after the body width changes,
            // as the viewport can stay the same, but in RTL, if body width changes, we need to work out the
            // virtual columns again
            this.bodyWidthDirty = true;
            this.setVirtualViewportLeftAndRight();
            if (this.ready) {
                this.checkDisplayedVirtualColumns();
            }
        }
    }

    public isPivotMode(): boolean {
        return this.pivotMode;
    }

    public checkPivotAllowed(): boolean {
        if (this.gridOptionsWrapper.getGroupKeysFunc() || this.gridOptionsWrapper.getIsGroupFunc()) {
            console.warn('ag-Grid: Pivot mode not available. You have provided either getGroupKeys() or ' +
                'isGroup() which imply tree data, which means you cannot turn pivot mode on.');
            return false;
        } else {
            return true;
        }
    }

    public setPivotMode(pivotMode: boolean): void {
        if (pivotMode === this.pivotMode) { return; }

        if (!this.checkPivotAllowed()) { return; }

        this.pivotMode = pivotMode;
        this.updateDisplayedColumns();
        let event: ColumnPivotModeChangedEvent = {
            type: Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    }

    public getSecondaryPivotColumn(pivotKeys: string[], valueColKey: Column|string): Column {

        if (!this.secondaryColumnsPresent) {
            return null;
        }

        let valueColumnToFind = this.getPrimaryColumn(valueColKey);

        let foundColumn: Column = null;
        this.secondaryColumns.forEach( column => {

            let thisPivotKeys = column.getColDef().pivotKeys;
            let pivotValueColumn = column.getColDef().pivotValueColumn;

            let pivotKeyMatches = _.compareArrays(thisPivotKeys, pivotKeys);
            let pivotValueMatches = pivotValueColumn === valueColumnToFind;

            if (pivotKeyMatches && pivotValueMatches) {
                foundColumn = column;
            }
        });

        return foundColumn;
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('ColumnController');
    }

    private setFirstRightAndLastLeftPinned(): void {
        let lastLeft: Column;
        let firstRight: Column;

        if (this.gridOptionsWrapper.isEnableRtl()) {
            lastLeft = this.displayedLeftColumns ? this.displayedLeftColumns[0] : null;
            firstRight = this.displayedRightColumns ? this.displayedRightColumns[this.displayedRightColumns.length - 1] : null;
        } else {
            lastLeft = this.displayedLeftColumns ? this.displayedLeftColumns[this.displayedLeftColumns.length - 1] : null;
            firstRight = this.displayedRightColumns ? this.displayedRightColumns[0] : null;
        }

        this.gridColumns.forEach( (column: Column) => {
            column.setLastLeftPinned(column === lastLeft);
            column.setFirstRightPinned(column === firstRight);
        } );
    }

    public autoSizeColumns(keys: (string|Column)[]): void {
        // because of column virtualisation, we can only do this function on columns that are
        // actually rendered, as non-rendered columns (outside the viewport and not rendered
        // due to column virtualisation) are not present. this can result in all rendered columns
        // getting narrowed, which in turn introduces more rendered columns on the RHS which
        // did not get autosized in the original run, leaving the visible grid with columns on
        // the LHS sized, but RHS no. so we keep looping through teh visible columns until
        // no more cols are available (rendered) to be resized

        // keep track of which cols we have resized in here
        let columnsAutosized: Column[] = [];
        // initialise with anything except 0 so that while loop executs at least once
        let changesThisTimeAround = -1;

        while (changesThisTimeAround!==0) {
            changesThisTimeAround = 0;
            this.actionOnGridColumns(keys, (column: Column): boolean => {
                // if already autosized, skip it
                if (columnsAutosized.indexOf(column) >= 0) { return; }
                // get how wide this col should be
                let preferredWidth = this.autoWidthCalculator.getPreferredWidthForColumn(column);
                // preferredWidth = -1 if this col is not on the screen
                if (preferredWidth>0) {
                    let newWidth = this.normaliseColumnWidth(column, preferredWidth);
                    column.setActualWidth(newWidth);
                    columnsAutosized.push(column);
                    changesThisTimeAround++;
                }
                return true;
            });
        }

        if (columnsAutosized.length > 0) {
            let event: ColumnResizedEvent = {
                type: Events.EVENT_COLUMN_RESIZED,
                columns: columnsAutosized,
                column: columnsAutosized.length === 1 ? columnsAutosized[0] : null,
                finished: true,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
        }
    }

    public autoSizeColumn(key: string|Column): void {
        this.autoSizeColumns([key]);
    }

    public autoSizeAllColumns(): void {
        let allDisplayedColumns = this.getAllDisplayedColumns();
        this.autoSizeColumns(allDisplayedColumns);
    }

    private getColumnsFromTree(rootColumns: OriginalColumnGroupChild[]): Column[] {
        let result: Column[] = [];
        recursiveFindColumns(rootColumns);
        return result;

        function recursiveFindColumns(childColumns: OriginalColumnGroupChild[]): void {
            for (let i = 0; i<childColumns.length; i++) {
                let child = childColumns[i];
                if (child instanceof Column) {
                    result.push(<Column>child);
                } else if (child instanceof OriginalColumnGroup) {
                    recursiveFindColumns((<OriginalColumnGroup>child).getChildren());
                }
            }
        }
    }

    public getAllDisplayedColumnGroups(): ColumnGroupChild[] {
        if (this.displayedLeftColumnTree && this.displayedRightColumnTree && this.displayedCentreColumnTree) {
            return this.displayedLeftColumnTree
                .concat(this.displayedCentreColumnTree)
                .concat(this.displayedRightColumnTree);
        } else {
            return null;
        }
    }

    // + columnSelectPanel
    public getPrimaryColumnTree(): OriginalColumnGroupChild[] {
        return this.primaryBalancedTree;
    }

    // + gridPanel -> for resizing the body and setting top margin
    public getHeaderRowCount(): number {
        return this.gridHeaderRowCount;
    }

    // + headerRenderer -> setting pinned body width
    public getLeftDisplayedColumnGroups(): ColumnGroupChild[] {
        return this.displayedLeftColumnTree;
    }
    // + headerRenderer -> setting pinned body width
    public getRightDisplayedColumnGroups(): ColumnGroupChild[] {
        return this.displayedRightColumnTree;
    }
    // + headerRenderer -> setting pinned body width
    public getCenterDisplayedColumnGroups(): ColumnGroupChild[] {
        return this.displayedCentreColumnTree;
    }

    public getDisplayedColumnGroups(type: string): ColumnGroupChild[] {
        switch (type) {
            case Column.PINNED_LEFT: return this.getLeftDisplayedColumnGroups();
            case Column.PINNED_RIGHT: return this.getRightDisplayedColumnGroups();
            default: return this.getCenterDisplayedColumnGroups();
        }
    }

    // gridPanel -> ensureColumnVisible
    public isColumnDisplayed(column: Column): boolean {
        return this.getAllDisplayedColumns().indexOf(column) >= 0;
    }

    // + csvCreator
    public getAllDisplayedColumns(): Column[] {
        return this.allDisplayedColumns;
    }

    public getAllDisplayedVirtualColumns(): Column[] {
        return this.allDisplayedVirtualColumns;
    }

    public getDisplayedLeftColumnsForRow(rowNode: RowNode): Column[] {
        if (!this.colSpanActive) {
            return this.displayedLeftColumns;
        } else {
            return this.getDisplayedColumnsForRow(rowNode, this.displayedLeftColumns);
        }
    }

    public getDisplayedRightColumnsForRow(rowNode: RowNode): Column[] {
        if (!this.colSpanActive) {
            return this.displayedRightColumns;
        } else {
            return this.getDisplayedColumnsForRow(rowNode, this.displayedRightColumns);
        }
    }

    private getDisplayedColumnsForRow(rowNode: RowNode, displayedColumns: Column[],
                                        filterCallback?: (column: Column)=>boolean,
                                        gapBeforeCallback?: (column: Column)=>boolean): Column[] {

        let result: Column[] = [];
        let lastConsideredCol: Column = null;

        for (let i = 0; i<displayedColumns.length; i++) {

            let col = displayedColumns[i];

            let colSpan = col.getColSpan(rowNode);
            if (colSpan > 1) {
                let colsToRemove = colSpan - 1;
                i += colsToRemove;
            }

            let filterPasses = filterCallback ? filterCallback(col) : true;

            if (filterPasses) {

                let gapBeforeColumn = gapBeforeCallback ? gapBeforeCallback(col) : false;
                let addInPreviousColumn = result.length===0 && gapBeforeColumn && lastConsideredCol;
                if (addInPreviousColumn) {
                    result.push(lastConsideredCol);
                }

                result.push(col);
            }

            lastConsideredCol = col;
        }

        return result;
    }

    // + rowRenderer
    // if we are not column spanning, this just returns back the virtual centre columns,
    // however if we are column spanning, then different rows can have different virtual
    // columns, so we have to work out the list for each individual row.
    public getAllDisplayedCenterVirtualColumnsForRow(rowNode: RowNode): Column[] {

        if (!this.colSpanActive) {
            return this.allDisplayedCenterVirtualColumns;
        }

        let gapBeforeCallback = (col: Column) => col.getLeft() > this.viewportLeft;

        return this.getDisplayedColumnsForRow(rowNode, this.displayedCenterColumns,
            this.isColumnInViewport.bind(this), gapBeforeCallback);
    }

    private isColumnInViewport(col: Column): boolean {
        let columnLeft = col.getLeft();
        let columnRight = col.getLeft() + col.getActualWidth();
        let columnToMuchLeft = columnLeft < this.viewportLeft && columnRight < this.viewportLeft;
        let columnToMuchRight = columnLeft > this.viewportRight && columnRight > this.viewportRight;

        return !columnToMuchLeft && !columnToMuchRight;
    }

    // used by:
    // + angularGrid -> setting pinned body width
    // todo: this needs to be cached
    public getPinnedLeftContainerWidth() {
        return this.getWidthOfColsInList(this.displayedLeftColumns);
    }
    // todo: this needs to be cached
    public getPinnedRightContainerWidth() {
        return this.getWidthOfColsInList(this.displayedRightColumns);
    }

    public updatePrimaryColumnList(keys: (string|Column)[],
                                   masterList: Column[],
                                   actionIsAdd: boolean,
                                   columnCallback: (column: Column)=>void,
                                   eventType: string): void {

        if (_.missingOrEmpty(keys)) { return; }

        let atLeastOne = false;

        keys.forEach( key => {
            let columnToAdd = this.getPrimaryColumn(key);
            if (!columnToAdd) {return;}

            if (actionIsAdd) {
                if (masterList.indexOf(columnToAdd)>=0) {return;}
                masterList.push(columnToAdd);
            } else {
                if (masterList.indexOf(columnToAdd)<0) {return;}
                _.removeFromArray(masterList, columnToAdd);
            }

            columnCallback(columnToAdd);
            atLeastOne = true;
        });

        if (!atLeastOne) { return; }

        this.updateDisplayedColumns();

        let event: ColumnEvent = {
            type: eventType,
            columns: masterList,
            column: masterList.length === 1 ? masterList[0] : null,
            api: this.gridApi,
            columnApi: this.columnApi
        };

        this.eventService.dispatchEvent(event);
    }

    public setRowGroupColumns(colKeys: (string|Column)[]): void {
        this.autoGroupsNeedBuilding = true;
        this.setPrimaryColumnList(colKeys, this.rowGroupColumns,
            Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            this.setRowGroupActive.bind(this));
    }

    private setRowGroupActive(active: boolean, column: Column): void {
        if (active === column.isRowGroupActive()) {return;}
        column.setRowGroupActive(active);
        if (!active) {
            column.setVisible(true);
        }
    }

    public addRowGroupColumn(key: string|Column): void {
        this.addRowGroupColumns([key]);
    }

    public addRowGroupColumns(keys: (string|Column)[]): void {
        this.autoGroupsNeedBuilding = true;
        this.updatePrimaryColumnList(keys, this.rowGroupColumns, true,
            this.setRowGroupActive.bind(this, true),
            Events.EVENT_COLUMN_ROW_GROUP_CHANGED);
    }

    public removeRowGroupColumns(keys: (string|Column)[]): void {
        this.autoGroupsNeedBuilding = true;
        this.updatePrimaryColumnList(keys, this.rowGroupColumns, false,
            this.setRowGroupActive.bind(this, false),
            Events.EVENT_COLUMN_ROW_GROUP_CHANGED);
    }

    public removeRowGroupColumn(key: string|Column): void {
        this.removeRowGroupColumns([key]);
    }

    public addPivotColumns(keys: (string|Column)[]): void {
        this.updatePrimaryColumnList(keys, this.pivotColumns, true,
            column => column.setPivotActive(true),
            Events.EVENT_COLUMN_PIVOT_CHANGED);
    }

    public setPivotColumns(colKeys: (string|Column)[]): void {
        this.setPrimaryColumnList(colKeys, this.pivotColumns, Events.EVENT_COLUMN_PIVOT_CHANGED,
            (added: boolean, column: Column) => {
                column.setPivotActive(added);
            }
        );
    }

    public addPivotColumn(key: string|Column): void {
        this.addPivotColumns([key]);
    }

    public removePivotColumns(keys: (string|Column)[]): void {
        this.updatePrimaryColumnList(keys, this.pivotColumns, false,
            column => column.setPivotActive(false),
            Events.EVENT_COLUMN_PIVOT_CHANGED);
    }

    public removePivotColumn(key: string|Column): void {
        this.removePivotColumns([key]);
    }

    private setPrimaryColumnList(colKeys: (string|Column)[],
                                    masterList: Column[],
                                    eventName: string,
                                    columnCallback: (added: boolean, column: Column)=>void ): void {
        masterList.length = 0;
        if (_.exists(colKeys)) {
            colKeys.forEach( key => {
                let column = this.getPrimaryColumn(key);
                masterList.push(column);
            });
        }

        this.primaryColumns.forEach( column => {
            let added = masterList.indexOf(column) >= 0;
            columnCallback(added, column);
        });

        this.updateDisplayedColumns();

        let event: ColumnEvent = {
            type: eventName,
            columns: masterList,
            column: masterList.length === 1 ? masterList[0] : null,
            api: this.gridApi,
            columnApi: this.columnApi
        };

        this.eventService.dispatchEvent(event);
    }

    public setValueColumns(colKeys: (string|Column)[]): void {
        this.setPrimaryColumnList(colKeys, this.valueColumns,
            Events.EVENT_COLUMN_VALUE_CHANGED,
            this.setValueActive.bind(this) );
    }

    private setValueActive(active: boolean, column: Column): void {
        if (active === column.isValueActive()) {return;}
        column.setValueActive(active);
        if (active && !column.getAggFunc()) {
            let defaultAggFunc = this.aggFuncService.getDefaultAggFunc(column);
            column.setAggFunc(defaultAggFunc);
        }
    }

    public addValueColumns(keys: (string|Column)[]): void {
        this.updatePrimaryColumnList(keys, this.valueColumns, true,
            this.setValueActive.bind(this, true),
            Events.EVENT_COLUMN_VALUE_CHANGED);
    }

    public addValueColumn(colKey: (string|Column)): void {
        this.addValueColumns([colKey]);
    }

    public removeValueColumn(colKey: (string|Column)): void {
        this.removeValueColumns([colKey]);
    }

    public removeValueColumns(keys: (string|Column)[]): void {
        this.updatePrimaryColumnList(keys, this.valueColumns, false,
            this.setValueActive.bind(this, false),
            Events.EVENT_COLUMN_VALUE_CHANGED);
    }

    // returns the width we can set to this col, taking into consideration min and max widths
    private normaliseColumnWidth(column: Column, newWidth: number): number {
        if (newWidth < column.getMinWidth()) {
            newWidth = column.getMinWidth();
        }

        if (column.isGreaterThanMax(newWidth)) {
            newWidth = column.getMaxWidth();
        }

        return newWidth;
    }

    private getPrimaryOrGridColumn(key: string|Column): Column {
        let column = this.getPrimaryColumn(key);
        if (column) {
            return column;
        } else {
            return this.getGridColumn(key);
        }
    }

    public setColumnWidth(key: string|Column, newWidth: number, finished: boolean): void {
        let column = this.getPrimaryOrGridColumn(key);
        if (!column) {
            return;
        }

        newWidth = this.normaliseColumnWidth(column, newWidth);

        let widthChanged = column.getActualWidth() !== newWidth;

        if (widthChanged) {
            column.setActualWidth(newWidth);
            this.setLeftValues();
        }

        this.updateBodyWidths();
        this.checkDisplayedVirtualColumns();

        // check for change first, to avoid unnecessary firing of events
        // however we always fire 'finished' events. this is important
        // when groups are resized, as if the group is changing slowly,
        // eg 1 pixel at a time, then each change will fire change events
        // in all the columns in the group, but only one with get the pixel.
        if (finished || widthChanged) {
            let event: ColumnResizedEvent = {
                type: Events.EVENT_COLUMN_RESIZED,
                columns: [column],
                column: column,
                finished: finished,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
        }
    }

    public setColumnAggFunc(column: Column, aggFunc: string): void {
        column.setAggFunc(aggFunc);
        let event: ColumnValueChangedEvent = {
            type: Events.EVENT_COLUMN_VALUE_CHANGED,
            columns: [column],
            column: column,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    }

    public moveRowGroupColumn(fromIndex: number, toIndex: number): void {
        let column = this.rowGroupColumns[fromIndex];
        this.rowGroupColumns.splice(fromIndex, 1);
        this.rowGroupColumns.splice(toIndex, 0, column);
        let event: ColumnRowGroupChangedEvent = {
            type: Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            columns: this.rowGroupColumns,
            column: this.rowGroupColumns.length === 1 ? this.rowGroupColumns[0] : null,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    }

    public moveColumns(columnsToMoveKeys: (string|Column)[], toIndex: number): void {
        this.columnAnimationService.start();

        if (toIndex > this.gridColumns.length - columnsToMoveKeys.length) {
            console.warn('ag-Grid: tried to insert columns in invalid location, toIndex = ' + toIndex);
            console.warn('ag-Grid: remember that you should not count the moving columns when calculating the new index');
            return;
        }

        // we want to pull all the columns out first and put them into an ordered list
        let columnsToMove = this.getGridColumns(columnsToMoveKeys);

        let failedRules = !this.doesMovePassRules(columnsToMove, toIndex);
        if (failedRules) { return; }

        _.moveInArray(this.gridColumns, columnsToMove, toIndex);

        this.updateDisplayedColumns();

        let event: ColumnMovedEvent = {
            type: Events.EVENT_COLUMN_MOVED,
            columns: columnsToMove,
            column: columnsToMove.length === 1 ? columnsToMove[0] : null,
            toIndex: toIndex,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);

        this.columnAnimationService.finish();
    }

    public doesMovePassRules(columnsToMove: Column[], toIndex: number): boolean {

        let allColumnsCopy = this.gridColumns.slice();

        _.moveInArray(allColumnsCopy, columnsToMove, toIndex);

        let rulesPass = true;

        this.columnUtils.depthFirstOriginalTreeSearch(this.gridBalancedTree, child => {
            if (!(child instanceof OriginalColumnGroup)) { return; }

            let columnGroup = <OriginalColumnGroup> child;

            let marryChildren = columnGroup.getColGroupDef() && columnGroup.getColGroupDef().marryChildren;
            if (!marryChildren) { return; }

            let newIndexes: number[] = [];
            columnGroup.getLeafColumns().forEach( col => {
                let newColIndex = allColumnsCopy.indexOf(col);
                newIndexes.push(newColIndex);
            } );

            let maxIndex = Math.max.apply(Math, newIndexes);
            let minIndex = Math.min.apply(Math, newIndexes);

            // width is how far the first column in this group is away from the last column
            let spread = maxIndex - minIndex;
            let maxSpread = columnGroup.getLeafColumns().length - 1;

            // if the columns
            if (spread > maxSpread) {
                rulesPass = false;
            }

            // console.log(`maxIndex = ${maxIndex}, minIndex = ${minIndex}, spread = ${spread}, maxSpread = ${maxSpread}, fail = ${spread > (count-1)}`)
            // console.log(allColumnsCopy.map( col => col.getColDef().field).join(','));
        });

        return rulesPass;
    }

    public moveColumn(key: string|Column, toIndex: number) {
        this.moveColumns([key], toIndex);
    }

    public moveColumnByIndex(fromIndex: number, toIndex: number): void {
        let column = this.gridColumns[fromIndex];
        this.moveColumn(column, toIndex);
    }

    // used by:
    // + angularGrid -> for setting body width
    // + rowController -> setting main row widths (when inserting and resizing)
    // need to cache this
    public getBodyContainerWidth(): number {
        return this.bodyWidth;
    }

    public getContainerWidth(pinned: string): number {
        switch (pinned) {
            case Column.PINNED_LEFT: return this.leftWidth;
            case Column.PINNED_RIGHT: return this.rightWidth;
            default: return this.bodyWidth;
        }
    }

    // after setColumnWidth or updateGroupsAndDisplayedColumns
    private updateBodyWidths(): void {
        let newBodyWidth = this.getWidthOfColsInList(this.displayedCenterColumns);
        let newLeftWidth = this.getWidthOfColsInList(this.displayedLeftColumns);
        let newRightWidth = this.getWidthOfColsInList(this.displayedRightColumns);

        // this is used by virtual col calculation, for RTL only, as a change to body width can impact displayed
        // columns, due to RTL inverting the y coordinates
        this.bodyWidthDirty = this.bodyWidth !== newBodyWidth;

        let atLeastOneChanged = this.bodyWidth !== newBodyWidth || this.leftWidth !== newLeftWidth || this.rightWidth !== newRightWidth;

        if (atLeastOneChanged) {
            this.bodyWidth = newBodyWidth;
            this.leftWidth = newLeftWidth;
            this.rightWidth = newRightWidth;
            // when this fires, it is picked up by the gridPanel, which ends up in
            // gridPanel calling setWidthAndScrollPosition(), which in turn calls setVirtualViewportPosition()
            let event: DisplayedColumnsWidthChangedEvent = {
                type: Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
        }
    }

    // + rowController
    public getValueColumns(): Column[] {
        return this.valueColumns ? this.valueColumns : [];
    }

    // + rowController
    public getPivotColumns(): Column[] {
        return this.pivotColumns ? this.pivotColumns : [];
    }

    // + inMemoryRowModel
    public isPivotActive(): boolean {
        return this.pivotColumns && this.pivotColumns.length > 0 && this.pivotMode;
    }

    // + toolPanel
    public getRowGroupColumns(): Column[] {
        return this.rowGroupColumns ? this.rowGroupColumns : [];
    }

    // + rowController -> while inserting rows
    public getDisplayedCenterColumns(): Column[] {
        return this.displayedCenterColumns;
    }
    // + rowController -> while inserting rows
    public getDisplayedLeftColumns(): Column[] {
        return this.displayedLeftColumns;
    }
    public getDisplayedRightColumns(): Column[] {
        return this.displayedRightColumns;
    }

    public getDisplayedColumns(type: string): Column[] {
        switch (type) {
            case Column.PINNED_LEFT: return this.getDisplayedLeftColumns();
            case Column.PINNED_RIGHT: return this.getDisplayedRightColumns();
            default: return this.getDisplayedCenterColumns();
        }
    }

    // used by:
    // + inMemoryRowController -> sorting, building quick filter text
    // + headerRenderer -> sorting (clearing icon)
    public getAllPrimaryColumns(): Column[] {
        return this.primaryColumns;
    }

    // + moveColumnController
    public getAllGridColumns(): Column[] {
        return this.gridColumns;
    }

    public isEmpty(): boolean {
        return _.missingOrEmpty(this.gridColumns);
    }

    public isRowGroupEmpty(): boolean {
        return _.missingOrEmpty(this.rowGroupColumns);
    }

    public setColumnVisible(key: string|Column, visible: boolean): void {
        this.setColumnsVisible([key], visible);
    }

    public setColumnsVisible(keys: (string|Column)[], visible: boolean): void {
        this.columnAnimationService.start();
        this.actionOnGridColumns(keys, (column: Column): boolean => {
            column.setVisible(visible);
            return true;
        }, ()=> {
            let event: ColumnVisibleEvent = {
                type: Events.EVENT_COLUMN_VISIBLE,
                visible: visible,
                column: null,
                columns: null,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            return event;
        });
        this.columnAnimationService.finish();
    }

    public setColumnPinned(key: string|Column, pinned: string|boolean): void {
        this.setColumnsPinned([key], pinned);
    }

    public setColumnsPinned(keys: (string|Column)[], pinned: string|boolean): void {
        this.columnAnimationService.start();

        let actualPinned: string;
        if (pinned === true || pinned === Column.PINNED_LEFT) {
            actualPinned = Column.PINNED_LEFT;
        } else if (pinned === Column.PINNED_RIGHT) {
            actualPinned = Column.PINNED_RIGHT;
        } else {
            actualPinned = null;
        }

        this.actionOnGridColumns(keys, (column: Column): boolean => {
            column.setPinned(actualPinned);
            return true;
        }, ()=> {
            let event: ColumnPinnedEvent = {
                type: Events.EVENT_COLUMN_PINNED,
                pinned: actualPinned,
                column: null,
                columns: null,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            return event;
        });

        this.columnAnimationService.finish();
    }

    // does an action on a set of columns. provides common functionality for looking up the
    // columns based on key, getting a list of effected columns, and then updated the event
    // with either one column (if it was just one col) or a list of columns
    // used by: autoResize, setVisible, setPinned
    private actionOnGridColumns(// the column keys this action will be on
                            keys: (string|Column)[],
                            // the action to do - if this returns false, the column was skipped
                            // and won't be included in the event
                            action: (column:Column) => boolean,
                            // should return back a column event of the right type
                            createEvent?: ()=> ColumnEvent): void {

        if (_.missingOrEmpty(keys)) { return; }

        let updatedColumns: Column[] = [];

        keys.forEach( (key: string|Column)=> {
            let column = this.getGridColumn(key);
            if (!column) {return;}
            // need to check for false with type (ie !== instead of !=)
            // as not returning anything (undefined) would also be false
            let resultOfAction = action(column);
            if (resultOfAction!==false) {
                updatedColumns.push(column);
            }
        });

        if (updatedColumns.length===0) { return; }

        this.updateDisplayedColumns();

        if (_.exists(createEvent)) {

            let event = createEvent();

            event.columns = updatedColumns;
            event.column = updatedColumns.length === 1 ? updatedColumns[0] : null;

            this.eventService.dispatchEvent(event);
        }
    }

    public getDisplayedColBefore(col: Column): Column {
        let allDisplayedColumns = this.getAllDisplayedColumns();
        let oldIndex = allDisplayedColumns.indexOf(col);
        if (oldIndex > 0) {
            return allDisplayedColumns[oldIndex - 1];
        } else {
            return null;
        }
    }

    // used by:
    // + rowRenderer -> for navigation
    public getDisplayedColAfter(col: Column): Column {
        let allDisplayedColumns = this.getAllDisplayedColumns();
        let oldIndex = allDisplayedColumns.indexOf(col);
        if (oldIndex < (allDisplayedColumns.length - 1)) {
            return allDisplayedColumns[oldIndex + 1];
        } else {
            return null;
        }
    }

    public isPinningLeft(): boolean {
        return this.displayedLeftColumns.length > 0;
    }

    public isPinningRight(): boolean {
        return this.displayedRightColumns.length > 0;
    }

    public getPrimaryAndSecondaryAndAutoColumns(): Column[] {
        let result = this.primaryColumns ? this.primaryColumns.slice(0) : [];
        if (_.exists(this.groupAutoColumns)) {
            this.groupAutoColumns.forEach( col => result.push(col) );
        }
        if (this.secondaryColumnsPresent) {
            this.secondaryColumns.forEach( column => result.push(column) );
        }
        return result;
    }

    private createStateItemFromColumn(column: Column): any {
        let rowGroupIndex = column.isRowGroupActive() ? this.rowGroupColumns.indexOf(column) : null;
        let pivotIndex = column.isPivotActive() ? this.pivotColumns.indexOf(column) : null;
        let aggFunc = column.isValueActive() ? column.getAggFunc() : null;
        let resultItem = {
            colId: column.getColId(),
            hide: !column.isVisible(),
            aggFunc: aggFunc,
            width: column.getActualWidth(),
            pivotIndex: pivotIndex,
            pinned: column.getPinned(),
            rowGroupIndex: rowGroupIndex
        };
        return resultItem;
    }

    public getColumnState(): any[] {
        if (_.missing(this.primaryColumns)) {
            return <any>[];
        }

        let columnStateList = this.primaryColumns.map(this.createStateItemFromColumn.bind(this));

        if (!this.pivotMode) {
            this.orderColumnStateList(columnStateList);
        }

        return columnStateList;
    }

    private orderColumnStateList(columnStateList: any[]): void {
        let gridColumnIds = this.gridColumns.map( column => column.getColId() );
        columnStateList.sort( (itemA: any, itemB: any) => {
            let posA = gridColumnIds.indexOf(itemA.colId);
            let posB = gridColumnIds.indexOf(itemB.colId);
            return posA - posB;
        });
    }

    public resetColumnState(): void {
        // we can't use 'allColumns' as the order might of messed up, so get the primary ordered list
        let primaryColumns = this.getColumnsFromTree(this.primaryBalancedTree);
        let state: any[] = [];

        if (primaryColumns) {
            primaryColumns.forEach( (column) => {
                state.push({
                    colId: column.getColId(),
                    aggFunc: column.getColDef().aggFunc,
                    hide: column.getColDef().hide,
                    pinned: column.getColDef().pinned,
                    rowGroupIndex: column.getColDef().rowGroupIndex,
                    pivotIndex: column.getColDef().pivotIndex,
                    width: column.getColDef().width
                });
            });
        }
        this.setColumnState(state);
    }

    public setColumnState(columnState: any[]): boolean {
        if (_.missingOrEmpty(this.primaryColumns)) { return false; }

        this.autoGroupsNeedBuilding = true;

        // at the end below, this list will have all columns we got no state for
        let columnsWithNoState = this.primaryColumns.slice();

        this.rowGroupColumns = [];
        this.valueColumns = [];
        this.pivotColumns = [];

        let success = true;

        let rowGroupIndexes: {[key: string]: number} = {};
        let pivotIndexes: {[key: string]: number} = {};

        if (columnState) {
            columnState.forEach( (stateItem: any)=> {
                let column = this.getPrimaryColumn(stateItem.colId);
                if (!column) {
                    console.warn('ag-grid: column ' + stateItem.colId + ' not found');
                    success = false;
                } else {
                    this.syncColumnWithStateItem(column, stateItem, rowGroupIndexes, pivotIndexes);
                    _.removeFromArray(columnsWithNoState, column);
                }
            });
        }

        // anything left over, we got no data for, so add in the column as non-value, non-rowGroup and hidden
        columnsWithNoState.forEach(this.syncColumnWithNoState.bind(this));

        // sort the lists according to the indexes that were provided
        this.rowGroupColumns.sort(this.sortColumnListUsingIndexes.bind(this, rowGroupIndexes));
        this.pivotColumns.sort(this.sortColumnListUsingIndexes.bind(this, pivotIndexes));

        this.copyDownGridColumns();

        let orderOfColIds = columnState.map( stateItem => stateItem.colId );
        this.gridColumns.sort( (colA: Column, colB: Column)=> {
            let indexA = orderOfColIds.indexOf(colA.getId());
            let indexB = orderOfColIds.indexOf(colB.getId());
            return indexA - indexB;
        });

        this.updateDisplayedColumns();

        let event: ColumnEverythingChangedEvent = {
            type: Events.EVENT_COLUMN_EVERYTHING_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);

        return success;
    }

    private sortColumnListUsingIndexes(indexes: {[key: string]: number}, colA: Column, colB: Column): number {
        let indexA = indexes[colA.getId()];
        let indexB = indexes[colB.getId()];
        return indexA - indexB;
    }

    private syncColumnWithNoState(column: Column): void {
        column.setVisible(false);
        column.setAggFunc(null);
        column.setPinned(null);
        column.setRowGroupActive(false);
        column.setPivotActive(false);
        column.setValueActive(false);
    }

    private syncColumnWithStateItem(column: Column, stateItem: any,
                                    rowGroupIndexes: {[key: string]: number},
                                    pivotIndexes: {[key: string]: number}): void {
        // following ensures we are left with boolean true or false, eg converts (null, undefined, 0) all to true
        column.setVisible(!stateItem.hide);
        // sets pinned to 'left' or 'right'
        column.setPinned(stateItem.pinned);
        // if width provided and valid, use it, otherwise stick with the old width
        if (stateItem.width >= this.gridOptionsWrapper.getMinColWidth()) {
            column.setActualWidth(stateItem.width);
        }

        if (typeof stateItem.aggFunc === 'string') {
            column.setAggFunc(stateItem.aggFunc);
            column.setValueActive(true);
            this.valueColumns.push(column);
        } else {
            if (_.exists(stateItem.aggFunc)) {
                console.warn('ag-Grid: stateItem.aggFunc must be a string. if using your own aggregation ' +
                    'functions, register the functions first before using them in get/set state. This is because it is' +
                    'intended for the column state to be stored and retrieved as simple JSON.');
            }
            column.setAggFunc(null);
            column.setValueActive(false);
        }

        if (typeof stateItem.rowGroupIndex === 'number') {
            this.rowGroupColumns.push(column);
            column.setRowGroupActive(true);
            rowGroupIndexes[column.getId()] = stateItem.rowGroupIndex;
        } else {
            column.setRowGroupActive(false);
        }

        if (typeof stateItem.pivotIndex === 'number') {
            this.pivotColumns.push(column);
            column.setPivotActive(true);
            pivotIndexes[column.getId()] = stateItem.pivotIndex;
        } else {
            column.setPivotActive(false);
        }
    }

    public getGridColumns(keys: (string|Column)[]): Column[] {
        return this.getColumns(keys, this.getGridColumn.bind(this));
    }

    private getColumns(keys: (string|Column)[], columnLookupCallback: (key: string|Column)=>Column ): Column[] {
        let foundColumns: Column[] = [];
        if (keys) {
            keys.forEach( (key: (string|Column)) => {
                let column = columnLookupCallback(key);
                if (column) {
                    foundColumns.push(column);
                }
            });
        }
        return foundColumns;
    }

    // used by growGroupPanel
    public getColumnWithValidation(key: string|Column): Column {
        let column = this.getPrimaryColumn(key);
        if (!column) {
            console.warn('ag-Grid: could not find column ' + column);
        }
        return column;
    }

    public getPrimaryColumn(key: string|Column): Column {
        return this.getColumn(key, this.primaryColumns);
    }

    public getGridColumn(key: string|Column): Column {
        return this.getColumn(key, this.gridColumns);
    }

    private getColumn(key: string|Column, columnList: Column[]): Column {
        if (!key) {return null;}

        for (let i = 0; i < columnList.length; i++) {
            if (this.columnsMatch(columnList[i], key)) {
                return columnList[i];
            }
        }

        return this.getAutoColumn(key);
    }

    private getAutoColumn(key: string|Column): Column {
        if (!_.exists(this.groupAutoColumns) || _.missing(this.groupAutoColumns)) { return null; }
        return _.find(this.groupAutoColumns, groupCol => {
            return this.columnsMatch(groupCol, key);
        });
    }

    private columnsMatch(column: Column, key: string|Column): boolean {
        let columnMatches = column === key;
        let colDefMatches = column.getColDef() === key;
        let idMatches = column.getColId() == key;
        return columnMatches || colDefMatches || idMatches;
    }

    public getDisplayNameForColumn(column: Column, location: string, includeAggFunc = false): string {
        let headerName = this.getHeaderName(column.getColDef(), column, null, location);
        if (includeAggFunc) {
            return this.wrapHeaderNameWithAggFunc(column, headerName);
        } else {
            return headerName;
        }
    }

    public getDisplayNameForColumnGroup(columnGroup: ColumnGroup, location: string): string {
        let colGroupDef = columnGroup.getOriginalColumnGroup().getColGroupDef();
        if (colGroupDef) {
            return this.getHeaderName(colGroupDef, null, columnGroup, location);
        } else {
            return null;
        }
    }

    // location is where the column is going to appear, ie who is calling us
    private getHeaderName(colDef: AbstractColDef, column: Column, columnGroup: ColumnGroup, location: string): string {
        let headerValueGetter = colDef.headerValueGetter;

        if (headerValueGetter) {
            let params = {
                colDef: colDef,
                column: column,
                columnGroup: columnGroup,
                location: location,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext()
            };

            if (typeof headerValueGetter === 'function') {
                // valueGetter is a function, so just call it
                return headerValueGetter(params);
            } else if (typeof headerValueGetter === 'string') {
                // valueGetter is an expression, so execute the expression
                return this.expressionService.evaluate(headerValueGetter, params);
            } else {
                console.warn('ag-grid: headerValueGetter must be a function or a string');
                return '';
            }
        } else if (colDef.headerName != null){
            return colDef.headerName;
        } else if ((<ColDef>colDef).field){
            return _.camelCaseToHumanText((<ColDef>colDef).field)
        } else {
            return '';
        }
    }

    /*
        private getHeaderGroupName(columnGroup: ColumnGroup): string {
            let colGroupDef = columnGroup.getOriginalColumnGroup().getColGroupDef();
            let headerValueGetter = colGroupDef.headerValueGetter;

            if (headerValueGetter) {
                let params = {
                    columnGroup: columnGroup,
                    colDef: colGroupDef,
                    api: this.gridOptionsWrapper.getApi(),
                    context: this.gridOptionsWrapper.getContext()
                };

                if (typeof headerValueGetter === 'function') {
                    // valueGetter is a function, so just call it
                    return headerValueGetter(params);
                } else if (typeof headerValueGetter === 'string') {
                    // valueGetter is an expression, so execute the expression
                    return this.expressionService.evaluate(headerValueGetter, params);
                } else {
                    console.warn('ag-grid: headerValueGetter must be a function or a string');
                    return '';
                }
            } else {
                return colGroupDef.headerName;
            }
        }
    */

    private wrapHeaderNameWithAggFunc(column: Column, headerName: string): string {
        if (this.gridOptionsWrapper.isSuppressAggFuncInHeader()) {
            return headerName;
        }

        // only columns with aggregation active can have aggregations
        let pivotValueColumn = column.getColDef().pivotValueColumn;
        let pivotActiveOnThisColumn = _.exists(pivotValueColumn);
        let aggFunc: string | IAggFunc = null;
        let aggFuncFound: boolean;

        // otherwise we have a measure that is active, and we are doing aggregation on it
        if (pivotActiveOnThisColumn) {
            aggFunc = pivotValueColumn.getAggFunc();
            aggFuncFound = true;
        } else {
            let measureActive = column.isValueActive();
            let aggregationPresent = this.pivotMode || !this.isRowGroupEmpty();

            if (measureActive && aggregationPresent) {
                aggFunc = column.getAggFunc();
                aggFuncFound = true;
            } else {
                aggFuncFound = false;
            }
        }

        if (aggFuncFound) {
            let aggFuncString = (typeof aggFunc === 'string') ? <string> aggFunc : 'func';
            let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            let aggFuncStringTranslated = localeTextFunc (aggFuncString, aggFuncString);
            return `${aggFuncStringTranslated}(${headerName})`;
        } else {
            return headerName;
        }
    }

    // returns the group with matching colId and instanceId. If instanceId is missing,
    // matches only on the colId.
    public getColumnGroup(colId: string|ColumnGroup, instanceId?: number): ColumnGroup {

        if (!colId) {return null;}

        if (colId instanceof ColumnGroup) {
            return colId;
        }

        let allColumnGroups = this.getAllDisplayedColumnGroups();
        let checkInstanceId = typeof instanceId === 'number';
        let result: ColumnGroup = null;

        this.columnUtils.depthFirstAllColumnTreeSearch(allColumnGroups, (child: ColumnGroupChild)=> {
            if (child instanceof ColumnGroup) {
                let columnGroup = <ColumnGroup> child;
                let matched: boolean;
                if (checkInstanceId) {
                    matched = colId === columnGroup.getGroupId() && instanceId === columnGroup.getInstanceId();
                } else {
                    matched = colId === columnGroup.getGroupId();
                }
                if (matched) {
                    result = columnGroup;
                }
            }
        });

        return result;
    }

    public setColumnDefs(columnDefs: (ColDef|ColGroupDef)[]) {
        // always invalidate cache on changing columns, as the column id's for the new columns
        // could overlap with the old id's, so the cache would return old values for new columns.
        this.valueCache.expire();

        // NOTE ==================
        // we should be destroying the existing columns and groups if they exist, for example, the original column
        // group adds a listener to the columns, it should be also removing the listeners

        this.autoGroupsNeedBuilding = true;

        let balancedTreeResult = this.balancedColumnTreeBuilder.createBalancedColumnGroups(columnDefs, true);
        this.primaryBalancedTree = balancedTreeResult.balancedTree;
        this.primaryHeaderRowCount = balancedTreeResult.treeDept + 1;

        this.primaryColumns = this.getColumnsFromTree(this.primaryBalancedTree);
        this.extractRowGroupColumns();
        this.extractPivotColumns();
        this.createValueColumns();

        this.copyDownGridColumns();

        this.updateDisplayedColumns();
        this.checkDisplayedVirtualColumns();

        this.ready = true;
        let eventEverythingChanged: ColumnEverythingChangedEvent = {
            type: Events.EVENT_COLUMN_EVERYTHING_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(eventEverythingChanged);

        let newColumnsLoadedEvent: NewColumnsLoadedEvent = {
            type: Events.EVENT_NEW_COLUMNS_LOADED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(newColumnsLoadedEvent);
    }

    public isReady(): boolean {
        return this.ready;
    }

    private extractRowGroupColumns(): void {
        this.rowGroupColumns.forEach( column => column.setRowGroupActive(false) );
        this.rowGroupColumns = [];
        // pull out items with rowGroupIndex
        this.primaryColumns.forEach( column => {
            if (typeof column.getColDef().rowGroupIndex === 'number') {
                this.rowGroupColumns.push(column);
                column.setRowGroupActive(true);
            }
        });
        // then sort them
        this.rowGroupColumns.sort(function (colA: Column, colB: Column): number {
            return colA.getColDef().rowGroupIndex - colB.getColDef().rowGroupIndex;
        });
        // now just pull out items rowGroup, they will be added at the end
        // after the indexed ones, but in the order the columns appear
        this.primaryColumns.forEach( column => {
            if (column.getColDef().rowGroup) {
                // if user already specified rowGroupIndex then we skip it as this col already included
                if (this.rowGroupColumns.indexOf(column)>=0) { return; }

                this.rowGroupColumns.push(column);
                column.setRowGroupActive(true);
            }
        });
    }

    private extractPivotColumns(): void {
        this.pivotColumns.forEach( column => column.setPivotActive(false) );
        this.pivotColumns = [];
        // pull out items with pivotIndex
        this.primaryColumns.forEach( (column: Column) => {
            if (typeof column.getColDef().pivotIndex === 'number') {
                this.pivotColumns.push(column);
                column.setPivotActive(true);
            }
        });
        // then sort them
        this.pivotColumns.sort(function (colA: Column, colB: Column): number {
            return colA.getColDef().pivotIndex - colB.getColDef().pivotIndex;
        });
        // now check the boolean equivalent
        this.primaryColumns.forEach( (column: Column) => {
            if (column.getColDef().pivot) {
                // if user already specified pivotIndex then we skip it as this col already included
                if (this.pivotColumns.indexOf(column)>=0) { return; }

                this.pivotColumns.push(column);
                column.setPivotActive(true);
            }
        });
    }

    public resetColumnGroupState(): void {
        let stateItems: {groupId: string, open: boolean}[] = [];

        this.columnUtils.depthFirstOriginalTreeSearch(this.primaryBalancedTree, child => {
            if (child instanceof OriginalColumnGroup) {
                let groupState = {
                    groupId: child.getGroupId(),
                    open: child.getColGroupDef().openByDefault
                };
                stateItems.push(groupState);
            }
        });

        this.setColumnGroupState(stateItems);
    }

    public getColumnGroupState(): {groupId: string, open: boolean}[] {
        let columnGroupState: {groupId: string, open: boolean}[] = [];
        this.columnUtils.depthFirstOriginalTreeSearch(this.gridBalancedTree, node => {
            if (node instanceof OriginalColumnGroup) {
                let originalColumnGroup = <OriginalColumnGroup> node;
                columnGroupState.push({
                    groupId: originalColumnGroup.getGroupId(),
                    open: originalColumnGroup.isExpanded()
                });
            }
        });
        return columnGroupState;
    }

    public setColumnGroupState(stateItems: {groupId: string, open: boolean}[]): void {
        this.columnAnimationService.start();

        let impactedGroups: OriginalColumnGroup[] = [];

        stateItems.forEach( stateItem => {
            let groupKey = stateItem.groupId;
            let newValue = stateItem.open;

            let originalColumnGroup: OriginalColumnGroup = this.getOriginalColumnGroup(groupKey);
            if (!originalColumnGroup) { return; }

            if (originalColumnGroup.isExpanded() === newValue) { return; }

            this.logger.log('columnGroupOpened(' + originalColumnGroup.getGroupId() + ',' + newValue + ')');
            originalColumnGroup.setExpanded(newValue);
            impactedGroups.push(originalColumnGroup);
        });

        this.updateGroupsAndDisplayedColumns();

        impactedGroups.forEach( originalColumnGroup => {
            let event: ColumnGroupOpenedEvent = {
                type: Events.EVENT_COLUMN_GROUP_OPENED,
                columnGroup: originalColumnGroup,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
        });

        this.columnAnimationService.finish();
    }

    // called by headerRenderer - when a header is opened or closed
    public setColumnGroupOpened(key: OriginalColumnGroup|string, newValue: boolean): void {
        let keyAsString: string;
        if (key instanceof OriginalColumnGroup) {
            keyAsString = (<OriginalColumnGroup>key).getId();
        } else {
            keyAsString = <string>key;
        }
        this.setColumnGroupState([{groupId: keyAsString, open: newValue}]);
    }

    public getOriginalColumnGroup(key: OriginalColumnGroup|string): OriginalColumnGroup {
        if (key instanceof OriginalColumnGroup) {
            return <OriginalColumnGroup> key;
        }

        if (typeof key !== 'string') {
            console.error('ag-Grid: group key must be a string');
        }

        // otherwise, search for the column group by id
        let res: OriginalColumnGroup = null;
        this.columnUtils.depthFirstOriginalTreeSearch(this.gridBalancedTree, node => {
            if (node instanceof OriginalColumnGroup) {
                let originalColumnGroup = <OriginalColumnGroup> node;
                if (originalColumnGroup.getId() === key) {
                    res = originalColumnGroup;
                }
            }
        });

        return res;
    }

    private calculateColumnsForDisplay(): Column[] {

        let columnsForDisplay: Column[];

        if (this.pivotMode && !this.secondaryColumnsPresent) {
            // pivot mode is on, but we are not pivoting, so we only
            // show columns we are aggregating on
            columnsForDisplay = this.createColumnsToDisplayFromValueColumns();
        } else {
            // otherwise continue as normal. this can be working on the primary
            // or secondary columns, whatever the gridColumns are set to
            columnsForDisplay = _.filter(this.gridColumns, column => column.isVisible() );
        }

        this.createGroupAutoColumnsIfNeeded();

        if (_.exists(this.groupAutoColumns)) {
            columnsForDisplay = this.groupAutoColumns.concat(columnsForDisplay);
        }

        return columnsForDisplay;
    }

    private checkColSpanActiveInCols(columns: Column[]): boolean {
        let result = false;
        columns.forEach( col => {
            if (_.exists(col.getColDef().colSpan)) {
                result = true;
            }
        });
        return result;
    }

    private calculateColumnsForGroupDisplay(): void {
        this.groupDisplayColumns = [];
        let checkFunc = (col: Column) => {
            let colDef = col.getColDef();
            if (colDef && _.exists(colDef.showRowGroup)) {
                this.groupDisplayColumns.push(col);
            }
        };

        this.gridColumns.forEach(checkFunc);
        if (this.groupAutoColumns) {
            this.groupAutoColumns.forEach(checkFunc);
        }
    }

    public getGroupDisplayColumns(): Column[] {
        return this.groupDisplayColumns;
    }

    private createColumnsToDisplayFromValueColumns(): Column [] {
        // make a copy of the value columns, so we have to side effects
        let result = this.valueColumns.slice();
        // order the columns as per the grid columns. having the order is
        // important as without it, reordering of columns would have no impact
        result.sort( (colA: Column, colB: Column)=> {
            return this.gridColumns.indexOf(colA) - this.gridColumns.indexOf(colB);
        });
        return result;
    }

    private updateDisplayedColumns(): void {

        let columnsForDisplay = this.calculateColumnsForDisplay();

        this.buildDisplayedTrees(columnsForDisplay);

        this.calculateColumnsForGroupDisplay();

        // this is also called when a group is opened or closed
        this.updateGroupsAndDisplayedColumns();

        this.setFirstRightAndLastLeftPinned();
    }

    public isSecondaryColumnsPresent(): boolean {
        return this.secondaryColumnsPresent;
    }

    public setSecondaryColumns(colDefs: (ColDef|ColGroupDef)[]): void {
        let newColsPresent = colDefs && colDefs.length>0;

        // if not cols passed, and we had to cols anyway, then do nothing
        if (!newColsPresent && !this.secondaryColumnsPresent) { return; }

        if (newColsPresent) {
            this.processSecondaryColumnDefinitions(colDefs);
            let balancedTreeResult = this.balancedColumnTreeBuilder.createBalancedColumnGroups(colDefs, false);
            this.secondaryBalancedTree = balancedTreeResult.balancedTree;
            this.secondaryHeaderRowCount = balancedTreeResult.treeDept + 1;
            this.secondaryColumns = this.getColumnsFromTree(this.secondaryBalancedTree);
            this.secondaryColumnsPresent = true;
        } else {
            this.secondaryBalancedTree = null;
            this.secondaryHeaderRowCount = -1;
            this.secondaryColumns = null;
            this.secondaryColumnsPresent = false;
        }

        this.copyDownGridColumns();
        this.updateDisplayedColumns();
    }

    private processSecondaryColumnDefinitions(colDefs: (ColDef|ColGroupDef)[]): (ColDef|ColGroupDef)[] {

        let columnCallback = this.gridOptionsWrapper.getProcessSecondaryColDefFunc();
        let groupCallback = this.gridOptionsWrapper.getProcessSecondaryColGroupDefFunc();

        if (!columnCallback && !groupCallback) { return; }

        searchForColDefs(colDefs);

        function searchForColDefs(colDefs2: (ColDef|ColGroupDef)[]): void {
            colDefs2.forEach( function(abstractColDef: AbstractColDef) {
                let isGroup = _.exists((<any>abstractColDef).children);
                if (isGroup) {
                    let colGroupDef = <ColGroupDef> abstractColDef;
                    if (groupCallback) {
                        groupCallback(colGroupDef);
                    }
                    searchForColDefs(colGroupDef.children);
                } else {
                    let colDef = <ColGroupDef> abstractColDef;
                    if (columnCallback) {
                        columnCallback(colDef);
                    }
                }
            });
        }
    }

    // called from: setColumnState, setColumnDefs, setAlternativeColumnDefs
    private copyDownGridColumns(): void {
        if (this.secondaryColumns) {
            this.gridBalancedTree = this.secondaryBalancedTree.slice();
            this.gridHeaderRowCount = this.secondaryHeaderRowCount;
            this.gridColumns = this.secondaryColumns.slice();
        } else {
            this.gridBalancedTree = this.primaryBalancedTree.slice();
            this.gridHeaderRowCount = this.primaryHeaderRowCount;
            this.gridColumns = this.primaryColumns.slice();
        }

        this.clearDisplayedColumns();

        this.colSpanActive = this.checkColSpanActiveInCols(this.gridColumns);

        let event: GridColumnsChangedEvent = {
            type: Events.EVENT_GRID_COLUMNS_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    }

    // gets called after we copy down grid columns, to make sure any part of the gui
    // that tries to draw, eg the header, it will get empty lists of columns rather
    // than stale columns. for example, the header will received gridColumnsChanged
    // event, so will try and draw, but it will draw successfully when it acts on the
    // virtualColumnsChanged event
    private clearDisplayedColumns(): void {
        this.displayedLeftColumnTree = [];
        this.displayedRightColumnTree = [];
        this.displayedCentreColumnTree = [];

        this.displayedLeftHeaderRows = {};
        this.displayedRightHeaderRows = {};
        this.displayedCentreHeaderRows = {};

        this.displayedLeftColumns = [];
        this.displayedRightColumns = [];
        this.displayedCenterColumns = [];
        this.allDisplayedColumns = [];
        this.allDisplayedVirtualColumns = [];
    }

    private updateGroupsAndDisplayedColumns() {
        this.updateGroups();
        this.updateDisplayedColumnsFromTrees();
        this.updateVirtualSets();
        this.updateBodyWidths();
        // this event is picked up by the gui, headerRenderer and rowRenderer, to recalculate what columns to display

        let event: DisplayedColumnsChangedEvent = {
            type: Events.EVENT_DISPLAYED_COLUMNS_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    }

    private updateDisplayedColumnsFromTrees(): void {
        this.addToDisplayedColumns(this.displayedLeftColumnTree, this.displayedLeftColumns);
        this.addToDisplayedColumns(this.displayedCentreColumnTree, this.displayedCenterColumns);
        this.addToDisplayedColumns(this.displayedRightColumnTree, this.displayedRightColumns);
        this.setupAllDisplayedColumns();
        this.setLeftValues();
    }

    private setupAllDisplayedColumns(): void {

        if (this.gridOptionsWrapper.isEnableRtl()) {
            this.allDisplayedColumns = this.displayedRightColumns
                .concat(this.displayedCenterColumns)
                .concat(this.displayedLeftColumns);
        } else {
            this.allDisplayedColumns = this.displayedLeftColumns
                .concat(this.displayedCenterColumns)
                .concat(this.displayedRightColumns);
        }
    }

    // sets the left pixel position of each column
    private setLeftValues(): void {
        this.setLeftValuesOfColumns();
        this.setLeftValuesOfGroups();
    }

    private setLeftValuesOfColumns(): void {
        // go through each list of displayed columns
        let allColumns = this.primaryColumns.slice(0);

        // let totalColumnWidth = this.getWidthOfColsInList()
        let doingRtl = this.gridOptionsWrapper.isEnableRtl();

        [this.displayedLeftColumns,this.displayedRightColumns,this.displayedCenterColumns].forEach( columns => {
            if (doingRtl) {
                // when doing RTL, we start at the top most pixel (ie RHS) and work backwards
                let left = this.getWidthOfColsInList(columns);
                columns.forEach( column => {
                    left -= column.getActualWidth();
                    column.setLeft(left);
                });
            } else {
                // otherwise normal LTR, we start at zero
                let left = 0;
                columns.forEach( column => {
                    column.setLeft(left);
                    left += column.getActualWidth();
                });
            }
            _.removeAllFromArray(allColumns, columns);
        });

        // items left in allColumns are columns not displayed, so remove the left position. this is
        // important for the rows, as if a col is made visible, then taken out, then made visible again,
        // we don't want the animation of the cell floating in from the old position, whatever that was.
        allColumns.forEach( (column: Column) => {
            column.setLeft(null);
        });
    }

    private setLeftValuesOfGroups(): void {
        // a groups left value is the lest left value of it's children
        [this.displayedLeftColumnTree,this.displayedRightColumnTree,this.displayedCentreColumnTree].forEach( columns => {
            columns.forEach( column => {
                if (column instanceof ColumnGroup) {
                    let columnGroup = <ColumnGroup> column;
                    columnGroup.checkLeft();
                }
            });
        });
    }

    private addToDisplayedColumns(displayedColumnTree: ColumnGroupChild[], displayedColumns: Column[]): void {
        displayedColumns.length = 0;
        this.columnUtils.depthFirstDisplayedColumnTreeSearch(displayedColumnTree, (child: ColumnGroupChild)=> {
            if (child instanceof Column) {
                displayedColumns.push(child);
            }
        });
    }

    private updateDisplayedCenterVirtualColumns(): {[key: string]: boolean} {

        let skipVirtualisation = this.gridOptionsWrapper.isSuppressColumnVirtualisation() || this.gridOptionsWrapper.isForPrint();
        if (skipVirtualisation) {
            // no virtualisation, so don't filter
            this.allDisplayedCenterVirtualColumns = this.displayedCenterColumns;
        } else {
            // filter out what should be visible
            this.allDisplayedCenterVirtualColumns = this.filterOutColumnsWithinViewport();
        }

        this.allDisplayedVirtualColumns = this.allDisplayedCenterVirtualColumns
            .concat(this.displayedLeftColumns)
            .concat(this.displayedRightColumns);

        // return map of virtual col id's, for easy lookup when building the groups.
        // the map will be colId=>true, ie col id's mapping to 'true'.
        let result: any = {};
        this.allDisplayedVirtualColumns.forEach( (col: Column) => {
            result[col.getId()] = true;
        });
        return result;
    }

    public getVirtualHeaderGroupRow(type: string, dept: number): ColumnGroupChild[] {
        let result: ColumnGroupChild[];
        switch (type) {
            case Column.PINNED_LEFT:
                result = this.displayedLeftHeaderRows[dept];
                break;
            case Column.PINNED_RIGHT:
                result = this.displayedRightHeaderRows[dept];
                break;
            default:
                result = this.displayedCentreHeaderRows[dept];
                break;
        }
        if (_.missing(result)) {
            result = [];
        }
        return result;
    }

    private updateDisplayedVirtualGroups(virtualColIds: any): void {

        // go through each group, see if any of it's cols are displayed, and if yes,
        // then this group is included

        this.displayedLeftHeaderRows = {};
        this.displayedRightHeaderRows = {};
        this.displayedCentreHeaderRows = {};

        testGroup(this.displayedLeftColumnTree, this.displayedLeftHeaderRows, 0);
        testGroup(this.displayedRightColumnTree, this.displayedRightHeaderRows, 0);
        testGroup(this.displayedCentreColumnTree, this.displayedCentreHeaderRows, 0);

        function testGroup(children: ColumnGroupChild[], result: {[row: number]: ColumnGroupChild[]}, dept: number): boolean {
            let returnValue = false;

            for (let i = 0; i<children.length; i++) {
                // see if this item is within viewport
                let child = children[i];
                let addThisItem: boolean;
                if (child instanceof Column) {
                    // for column, test if column is included
                    addThisItem = virtualColIds[child.getId()] === true;
                } else {
                    // if group, base decision on children
                    let columnGroup = <ColumnGroup> child;
                    addThisItem = testGroup(columnGroup.getDisplayedChildren(), result, dept+1);
                }

                if (addThisItem) {
                    returnValue = true;
                    if (!result[dept]) {
                        result[dept] = [];
                    }
                    result[dept].push(child);
                }
            }

            return returnValue;
        }
    }

    private updateVirtualSets(): void {
        let virtualColIds = this.updateDisplayedCenterVirtualColumns();
        this.updateDisplayedVirtualGroups(virtualColIds);
    }

    private filterOutColumnsWithinViewport(): Column[] {
        return _.filter(this.displayedCenterColumns, this.isColumnInViewport.bind(this));
    }

    // called from api
    public sizeColumnsToFit(gridWidth: any): void {
        // avoid divide by zero
        let allDisplayedColumns = this.getAllDisplayedColumns();

        if (gridWidth <= 0 || allDisplayedColumns.length === 0) {
            return;
        }

        let colsToNotSpread = _.filter(allDisplayedColumns, (column: Column): boolean => {
            return column.getColDef().suppressSizeToFit === true;
        });
        let colsToSpread = _.filter(allDisplayedColumns, (column: Column): boolean => {
            return column.getColDef().suppressSizeToFit !== true;
        });

        // make a copy of the cols that are going to be resized
        let colsToFireEventFor = colsToSpread.slice(0);

        let finishedResizing = false;
        while (!finishedResizing) {
            finishedResizing = true;
            let availablePixels = gridWidth - this.getWidthOfColsInList(colsToNotSpread);
            if (availablePixels <= 0) {
                // no width, set everything to minimum
                colsToSpread.forEach( (column: Column) => {
                    column.setMinimum();
                });
            } else {
                let scale = availablePixels / this.getWidthOfColsInList(colsToSpread);
                // we set the pixels for the last col based on what's left, as otherwise
                // we could be a pixel or two short or extra because of rounding errors.
                let pixelsForLastCol = availablePixels;
                // backwards through loop, as we are removing items as we go
                for (let i = colsToSpread.length - 1; i >= 0; i--) {
                    let column = colsToSpread[i];
                    let newWidth = Math.round(column.getActualWidth() * scale);
                    if (newWidth < column.getMinWidth()) {
                        column.setMinimum();
                        moveToNotSpread(column);
                        finishedResizing = false;
                    } else if (column.isGreaterThanMax(newWidth)) {
                        column.setActualWidth(column.getMaxWidth());
                        moveToNotSpread(column);
                        finishedResizing = false;
                    } else {
                        let onLastCol = i === 0;
                        if (onLastCol) {
                            column.setActualWidth(pixelsForLastCol);
                        } else {
                            column.setActualWidth(newWidth);
                        }
                    }
                    pixelsForLastCol -= newWidth;
                }
            }
        }

        this.setLeftValues();
        this.updateBodyWidths();

        colsToFireEventFor.forEach( (column: Column) => {
            let event: ColumnResizedEvent = {
                type: Events.EVENT_COLUMN_RESIZED,
                column: column,
                columns: [column],
                finished: true,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
        });

        function moveToNotSpread(column: Column) {
            _.removeFromArray(colsToSpread, column);
            colsToNotSpread.push(column);
        }
    }

    private buildDisplayedTrees(visibleColumns: Column[]) {
        let leftVisibleColumns = _.filter(visibleColumns, (column)=> {
            return column.getPinned() === 'left';
        });

        let rightVisibleColumns = _.filter(visibleColumns, (column)=> {
            return column.getPinned() === 'right';
        });

        let centerVisibleColumns = _.filter(visibleColumns, (column)=> {
            return column.getPinned() !== 'left' && column.getPinned() !== 'right';
        });

        let groupInstanceIdCreator = new GroupInstanceIdCreator();

        this.displayedLeftColumnTree = this.displayedGroupCreator.createDisplayedGroups(
            leftVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator, this.displayedLeftColumnTree);
        this.displayedRightColumnTree = this.displayedGroupCreator.createDisplayedGroups(
            rightVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator, this.displayedRightColumnTree);
        this.displayedCentreColumnTree = this.displayedGroupCreator.createDisplayedGroups(
            centerVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator, this.displayedCentreColumnTree);
    }

    private updateGroups(): void {
        let allGroups = this.getAllDisplayedColumnGroups();
        this.columnUtils.depthFirstAllColumnTreeSearch(allGroups, (child: ColumnGroupChild)=> {
            if (child instanceof ColumnGroup) {
                let group = <ColumnGroup> child;
                group.calculateDisplayedColumns();
            }
        });
    }

    public getGroupAutoColumns(): Column[] {
        return this.groupAutoColumns;
    }

    private createGroupAutoColumnsIfNeeded(): void {

        if (!this.autoGroupsNeedBuilding) { return; }
        this.autoGroupsNeedBuilding = false;

        // see if we need to insert the default grouping column
        let needAutoColumns = this.rowGroupColumns.length > 0
            && !this.gridOptionsWrapper.isGroupSuppressAutoColumn()
            && !this.gridOptionsWrapper.isGroupUseEntireRow()
            && !this.gridOptionsWrapper.isGroupSuppressRow();

        if (needAutoColumns) {
            this.groupAutoColumns = this.autoGroupColService.createAutoGroupColumns(this.rowGroupColumns);
        } else {
            this.groupAutoColumns = null;
        }
    }

    private createValueColumns(): void {
        this.valueColumns.forEach( column => column.setValueActive(false) );
        this.valueColumns = [];

        // override with columns that have the aggFunc specified explicitly
        for (let i = 0; i < this.primaryColumns.length; i++) {
            let column = this.primaryColumns[i];
            if (column.getColDef().aggFunc) {
                column.setAggFunc(column.getColDef().aggFunc);
                this.valueColumns.push(column);
                column.setValueActive(true);
            }
        }
    }

    private getWidthOfColsInList(columnList: Column[]) {
        let result = 0;
        for (let i = 0; i<columnList.length; i++) {
            result += columnList[i].getActualWidth();
        }
        return result;
    }

    public getGridBalancedTree():OriginalColumnGroupChild[]{
        return this.gridBalancedTree
    }
}
