import config from '@app/config';
import { Card, Flex, FlexItem, FormSelect, FormSelectOption, Label, Page, PageSection, Text, TextContent, TextInput, TextVariants } from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import { Table, Tbody, Td, Th, Thead, ThProps, Tr } from '@patternfly/react-table';
import axios from 'axios';
import * as React from 'react';
import { Link } from 'react-router-dom';

interface Row {
    id: number;
    claim_number: string;
    category: string;
    client_name: string;
    policy_number: string;
    status: string;
}

const ClaimsList: React.FunctionComponent = () => {

    // Claims data
    const [claims, setClaims] = React.useState([]);
    React.useEffect(() => {
        axios.get(config.backend_api_url + '/db/claims')
            .then(response => {
                setClaims(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    const rows: Row[] = claims.map((claim: any) => ({
        id: claim.id,
        claim_number: claim.claim_number,
        category: claim.category,
        client_name: claim.client_name,
        policy_number: claim.policy_number,
        status: claim.summary ? '処理済み' : '新規',
    }));

    // Filter and sort
    const [searchText, setSearchText] = React.useState('');
    const [formSelectValueCategory, setFormSelectValueCategory] = React.useState('すべてのカテゴリ');
    const [formSelectValueStatus, setFormSelectValueStatus] = React.useState('すべてのステータス');

    const onChangeCategory = (_event: React.FormEvent<HTMLSelectElement>, value: string) => {
        setFormSelectValueCategory(value);
    };

    const onChangeStatus = (_event: React.FormEvent<HTMLSelectElement>, value: string) => {
        setFormSelectValueStatus(value);
    };

    const filteredRows = rows.filter(row =>
        Object.entries(row)
            .filter(([key]) => key !== 'summary') // Exclude the summary field from the search
            .map(([_, value]) => value)
            .some(val => val.toString().toLowerCase().includes(searchText.toLowerCase())) // Search all fields with the search text
        && (
            row.category === formSelectValueCategory || formSelectValueCategory === 'すべてのカテゴリ' // Filter by category
        )
        && (
            row.status === formSelectValueStatus || formSelectValueStatus === 'すべてのステータス' // Filter by status
        )
    );

    const columnNames = {
        id: 'ID',
        claim_number: '請求番号',
        category: 'カテゴリ',
        client_name: '顧客名',
        policy_number: 'ポリシー番号',
        status: 'ステータス'
    }

    // Index of the currently sorted column
    const [activeSortIndex, setActiveSortIndex] = React.useState<number | null>(null);

    // Sort direction of the currently sorted column
    const [activeSortDirection, setActiveSortDirection] = React.useState<'asc' | 'desc' | null>(null);

    // Since OnSort specifies sorted columns by index, we need sortable values for our object by column index.
    const getSortableRowValues = (row: Row): (string | number)[] => {
        const { id, claim_number, category, client_name, policy_number, status } = row;
        return [id, claim_number, category, client_name, policy_number, status];
    };

    // Note that we perform the sort as part of the component's render logic and not in onSort.
    // We shouldn't store the list of data in state because we don't want to have to sync that with props.
    let sortedRows = filteredRows;
    if (activeSortIndex !== null) {
        sortedRows = rows.sort((a, b) => {
            const aValue = getSortableRowValues(a)[activeSortIndex as number];
            const bValue = getSortableRowValues(b)[activeSortIndex as number];
            if (typeof aValue === 'number') {
                // Numeric sort
                if (activeSortDirection === 'asc') {
                    return (aValue as number) - (bValue as number);
                }
                return (bValue as number) - (aValue as number);
            } else {
                // String sort
                if (activeSortDirection === 'asc') {
                    return (aValue as string).localeCompare(bValue as string);
                }
                return (bValue as string).localeCompare(aValue as string);
            }
        });
    }

    const getSortParams = (columnIndex: number): ThProps['sort'] => ({
        sortBy: {
            // @ts-ignore
            index: activeSortIndex,
            // @ts-ignore
            direction: activeSortDirection,
            defaultDirection: 'asc' // starting sort direction when first sorting a column. Defaults to 'asc'
        },
        onSort: (_event, index, direction) => {
            setActiveSortIndex(index);
            setActiveSortDirection(direction);
        },
        columnIndex
    });

    // Custom render for the status column
    const labelColors = {
        '処理済み': 'green',
        '新規': 'blue',
    };

    return (
        <Page>
            <PageSection>
                <TextContent>
                    <Text component={TextVariants.h1}>請求一覧</Text>
                </TextContent>
            </PageSection>
            <PageSection>
                <Flex>
                    <FlexItem>
                        <TextInput
                            value={searchText}
                            type="search"
                            onChange={(_event, searchText) => setSearchText(searchText)}
                            aria-label="search text input"
                            placeholder="請求をを検索"
                            customIcon={<SearchIcon />}
                            className='claims-list-filter-search'
                        />
                    </FlexItem>
                    <FlexItem align={{ default: 'alignRight' }}>
                        <FormSelect
                            value={formSelectValueCategory}
                            onChange={onChangeCategory}
                            aria-label="FormSelect Input"
                            ouiaId="BasicFormSelectCategory"
                            className="claims-list-filter-select"
                        >
                            <FormSelectOption key={0} value="すべてのカテゴリ" label="すべてのカテゴリ" />
                            <FormSelectOption key={1} value="単体車両" label="単体車両" />
                            <FormSelectOption key={2} value="複数車両" label="複数車両" />
                            <FormSelectOption key={3} value="盗難" label="盗難" />
                        </FormSelect>
                    </FlexItem>
                    <FlexItem>
                        <FormSelect
                            value={formSelectValueStatus}
                            onChange={onChangeStatus}
                            aria-label="FormSelect Input"
                            ouiaId="BasicFormSelectStatus"
                            className="claims-list-filter-select"
                        >
                            <FormSelectOption key={0} value="すべてのステータス" label="すべてのステータス" />
                            <FormSelectOption key={1} value="新規" label="新規" />
                            <FormSelectOption key={2} value="処理済み" label="処理済み" />
                        </FormSelect>
                    </FlexItem>
                </Flex>
            </PageSection>
            <PageSection>
                <Card component="div">
                    <Table aria-label="Claims list" isStickyHeader>
                        <Thead>
                            <Tr>
                                <Th sort={getSortParams(1)} width={10}>{columnNames.claim_number}</Th>
                                <Th sort={getSortParams(2)} width={10}>{columnNames.category}</Th>
                                <Th sort={getSortParams(3)} width={10}>{columnNames.client_name}</Th>
                                <Th sort={getSortParams(4)} width={10}>{columnNames.policy_number}</Th>
                                <Th sort={getSortParams(5)} width={10}>{columnNames.status}</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {sortedRows.map((row, rowIndex) => (
                                <Tr key={rowIndex}>
                                    <Td dataLabel={columnNames.claim_number}>
                                        <Link to={`/ClaimDetail/${row.id}`}>{row.claim_number}</Link>
                                    </Td>
                                    <Td dataLabel={columnNames.category}>{row.category}</Td>
                                    <Td dataLabel={columnNames.client_name}>{row.client_name}</Td>
                                    <Td dataLabel={columnNames.policy_number}>{row.policy_number}</Td>
                                    <Td dataLabel={columnNames.status}><Label color={labelColors[row.status] || 'default'}>{row.status}</Label></Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Card>
            </PageSection>
        </Page>
    )
}

export { ClaimsList };
