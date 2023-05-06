import React from 'react'
import { IParty } from '../../models/IParty';
import { Button, Card, Col, FloatingLabel, Form, Modal, Row } from 'react-bootstrap';
import { PokemonIcon } from '../atoms/PokemonIcon';
import { PeopleFill, Trash3 } from 'react-bootstrap-icons';
import { encode } from '../../util';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { deleteTeam, getTeams} from '../../services/firebase-teams';
import { useNavigate } from 'react-router-dom';
import { User } from "firebase/auth";
import CSS from 'csstype';

interface ITeamListProps {
    variant?: string;
    style?: CSS.Properties;
    reset?: number;

    handleTeamSelect?: (team: IParty | undefined) => void;
}

export const TeamsList: React.FC<ITeamListProps> = ({variant, style, handleTeamSelect, reset}) => {
    const [ deletingTeam, setDeletingTeam ] = React.useState<IParty>();
    const [ showModal, setShowModal ] = React.useState(false);
    const [ teams, setTeams ] = React.useState<IParty[]>([]);
    const [ selectedTeamValue, setSelectedTeamValue ] = React.useState(-1);

    const { authUser } = useFirebaseAuth();
    const navigate = useNavigate();

    const loadTeams = React.useCallback(async () => {
        if (!authUser) return;
        console.log(`Teamlist: loading teams from firebase ...`);

        try {
            const fbTeams = await getTeams(authUser);
            setTeams(fbTeams);
        } catch (error) {
            console.error(error);
        }
    }, [authUser]);

    React.useEffect(() => {
        if(reset === 2) setSelectedTeamValue(-1);
    }, [reset]);

    React.useEffect(() => {
        loadTeams();
    }, [loadTeams]);

    const handleDeleteTeam = (team: IParty) => {
        setDeletingTeam(team);
        setShowModal(true);
    };

    const handleDeleteTeamCofirmation = async () => {
        const res = await deleteTeam(deletingTeam as IParty, authUser as User);
        if(res) setTeams(res);
        setShowModal(false);
    };

    const localHandleTeamSelect = (teamIndex: number) => {
        setSelectedTeamValue(teamIndex);
        if(handleTeamSelect) handleTeamSelect(teams[teamIndex]);
    };

    if(variant && variant === 'select') return (
        <>
            <Card style={style}>
                <Card.Header>Select your team:</Card.Header>
                <Card.Body>

                    <FloatingLabel label='Team'>
                        <Form.Select id='teamSelect' onChange={(e) => localHandleTeamSelect(Number.parseInt(e.target.value))} value={selectedTeamValue}>
                            <option value={-1}>- Random -</option>
                            {teams.map((team, index) => <option key={team.id} value={index}>{team.name}</option>)}
                        </Form.Select>
                    </FloatingLabel>

                    <p style={{marginTop: '10px'}}>Team Summary:</p>
                    <p className='textAlignCenter'>
                        {
                            selectedTeamValue > -1 ? 
                            teams[selectedTeamValue].pokemon.map((pokemon, index) => <PokemonIcon key={index} pokemonId={pokemon.pokemonId}/>) : 
                            <>
                                <PokemonIcon pokemonId={0}/>
                                <PokemonIcon pokemonId={0}/>
                                <PokemonIcon pokemonId={0}/>
                                <PokemonIcon pokemonId={0}/>
                                <PokemonIcon pokemonId={0}/>
                                <PokemonIcon pokemonId={0}/>
                            </>
                        }
                    </p>

                </Card.Body>
            </Card>
        </>
    )

    return (
        <>
            <h1>Teambuilder</h1>
            <Row>
                <Col>
                    <Button style={{float: 'right'}} onClick={() => navigate(`/teambuilder/${encode(`temp-${authUser?.uid}-${Date.now()}`)}`)}><PeopleFill/> Create New Team</Button>
                    <h6 style={{marginBottom: '32px'}}>{`Teams: (${teams.length})`}</h6>
                </Col>
            </Row>
            
            <Row>
                {teams.map((team, index) =>
                    <Col key={team.id} xs={4} style={{position: 'relative'}}>
                        <Button variant='link' style={{position: 'absolute', color: 'white', zIndex: 1, right: '20px'}} onClick={() => handleDeleteTeam(team)}><Trash3/></Button>
                        <a href={`/teambuilder/${team.id}`} style={{color: 'black', textDecoration: 'none'}}> 
                            <Card className='sm-card'>
                                <Card.Header>
                                    {team.name?team.name:`(Team ${index+1})`}    
                                </Card.Header>
                                <Card.Body>
                                    {team.pokemon.map((pokemon, index) => <PokemonIcon key={index} pokemonId={pokemon.pokemonId}/>)}
                                </Card.Body>
                            </Card>
                        </a>
                    </Col>
                )}
            </Row>

            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
            >
                <Modal.Header closeButton />
                <Modal.Body>
                    <>
                        <p>{`Are you sure you want to remove '${deletingTeam?.name}'?`}</p>
                        <div style={{float: 'right'}}>
                            <Button variant='danger' style={{width: '120px', margin:'0px 4px'}} onClick={handleDeleteTeamCofirmation}>Yes</Button>
                            <Button variant='outline-secondary' style={{width: '120px', margin:'0px 4px'}} onClick={() => setShowModal(false)}>No</Button>
                        </div>
                    </>
                </Modal.Body>
            </Modal>
        </>
    )
}
